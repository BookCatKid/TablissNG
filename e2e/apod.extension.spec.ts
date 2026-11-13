import path from "node:path";

import { expect, test } from "@playwright/test";

import { closeExtension, launchExtension } from "./extensionHarness";
import { selectBackground } from "./helpers";

type PermissionTestWindow = Window & {
  chrome: {
    permissions: {
      contains: (
        permission: { origins?: string[] },
        callback?: (allowed: boolean) => void,
      ) => Promise<boolean>;
      request: (
        permission: { origins?: string[] },
        callback?: (allowed: boolean) => void,
      ) => Promise<boolean>;
      onAdded: {
        addListener: (listener: () => void) => void;
        removeListener: (listener: () => void) => void;
      };
      onRemoved: {
        addListener: (listener: () => void) => void;
        removeListener: (listener: () => void) => void;
      };
    };
  };
  __apodRequestedOrigins: string[];
  __startStaleAccessCheck: () => void;
  __revokeApodAccess: () => void;
  __finishStaleAccessCheck: () => void;
};

test("loads APOD after granting access to the NASA host", async () => {
  const session = await launchExtension();
  const { page, context } = session;
  const endpoint = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
  const imageUrl = "https://assets.science.nasa.gov/apod-test.jpg";

  try {
    // Native permission dialogs cannot be approved in headless Chrome.
    await page.addInitScript(() => {
      const testWindow = window as PermissionTestWindow;
      let allowed = false;
      const added = new Set<() => void>();
      const removed = new Set<() => void>();
      let deferChecks = false;
      const pendingChecks: Array<() => void> = [];
      testWindow.__apodRequestedOrigins = [];
      const permissions = testWindow.chrome.permissions;
      permissions.contains = (_permission, callback) => {
        if (deferChecks) {
          const result = allowed;
          return new Promise<boolean>((resolve) =>
            pendingChecks.push(() => {
              callback?.(result);
              resolve(result);
            }),
          );
        }
        callback?.(allowed);
        return Promise.resolve(allowed);
      };
      permissions.request = (permission, callback) => {
        testWindow.__apodRequestedOrigins = permission.origins || [];
        allowed = true;
        callback?.(allowed);
        added.forEach((listener) => listener());
        return Promise.resolve(allowed);
      };
      permissions.onAdded.addListener = (listener) => {
        added.add(listener);
      };
      permissions.onAdded.removeListener = (listener) => {
        added.delete(listener);
      };
      permissions.onRemoved.addListener = (listener) => {
        removed.add(listener);
      };
      permissions.onRemoved.removeListener = (listener) => {
        removed.delete(listener);
      };
      testWindow.__startStaleAccessCheck = () => {
        deferChecks = true;
        added.forEach((listener) => listener());
        deferChecks = false;
      };
      testWindow.__revokeApodAccess = () => {
        allowed = false;
        removed.forEach((listener) => listener());
      };
      testWindow.__finishStaleAccessCheck = () => {
        pendingChecks.splice(0).forEach((resolve) => resolve());
      };
    });
    await page.reload();
    await page.route(`${endpoint}**`, (route) =>
      route.fulfill({
        json: [
          {
            date: "2026-09-30",
            title: "APOD permission test",
            permalink: "https://science.nasa.gov/image-article/test/",
            hdurl: imageUrl,
            media_type: "image",
          },
        ],
      }),
    );
    await context.route(imageUrl, (route) =>
      route.fulfill({
        path: path.join(__dirname, "fixtures", "pixel.png"),
        contentType: "image/png",
      }),
    );
    await selectBackground(page, "background/apod");
    const accessButton = page.getByRole("button", {
      name: "Allow NASA access",
    });
    await expect(accessButton).toBeVisible();
    await accessButton.click();
    expect(
      await page.evaluate(
        () => (window as PermissionTestWindow).__apodRequestedOrigins,
      ),
    ).toEqual(["https://science.nasa.gov/*"]);

    await expect(accessButton).toHaveCount(0);
    await expect(page.locator(".Apod .image").last()).toHaveCSS(
      "background-image",
      `url("${imageUrl}")`,
    );
    await page.evaluate(() => {
      const state = window as PermissionTestWindow;
      state.__startStaleAccessCheck();
      state.__revokeApodAccess();
    });
    await expect(accessButton).toBeVisible();
    await page.evaluate(() => {
      (window as PermissionTestWindow).__finishStaleAccessCheck();
      return new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
    await expect(accessButton).toBeVisible();
  } finally {
    await closeExtension(session);
  }
});
