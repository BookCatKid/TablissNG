import { expect, type Page, test } from "@playwright/test";

import { closeExtension, launchExtension } from "./extensionHarness";
import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

type ChromeExtensionApi = {
  permissions: {
    contains(
      details: { permissions: string[] },
      callback?: (granted: boolean) => void,
    ): Promise<boolean> | void;
    request(
      details: { permissions: string[] },
      callback?: (granted: boolean) => void,
    ): Promise<boolean> | void;
  };
  bookmarks: {
    getTree(
      callback?: (results: BookmarkTreeNodeFixture[]) => void,
    ): Promise<BookmarkTreeNodeFixture[]> | void;
    getSubTree(
      id: string,
      callback?: (results: BookmarkTreeNodeFixture[]) => void,
    ): Promise<BookmarkTreeNodeFixture[]> | void;
  };
};

type BookmarkTreeNodeFixture = {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkTreeNodeFixture[];
};

type ExtensionWindow = Window & {
  chrome: ChromeExtensionApi;
  browser: ChromeExtensionApi;
  __e2ePermissionRequests?: { permissions: string[] }[];
};

async function addQuickLinks(page: Page) {
  await addWidget(page, "widget/links");
  await expandWidgetSettings(page, "Quick Links");
  return widgetSettingsFieldset(page, "Quick Links");
}

test.describe("Quick Links extension integration", () => {
  test("shows the optional bookmarks permission gate", async () => {
    const session = await launchExtension();
    const { page } = session;

    try {
      const settings = await addQuickLinks(page);
      await expect(
        settings.getByText("Bookmarks permission is required to import."),
      ).toBeVisible();
      await expect(
        settings.getByRole("button", { name: "Request Permission" }),
      ).toBeEnabled();
      expect(
        await page.evaluate(() =>
          (window as ExtensionWindow).chrome.permissions.contains({
            permissions: ["bookmarks"],
          }),
        ),
      ).toBe(false);
    } finally {
      await closeExtension(session);
    }
  });

  test("uses browser tabs for opted-in and restricted URLs", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      const urlInput = link.locator('input[type="url"]');
      const extensionRoot = page.url().split("?")[0];

      await urlInput.fill(`${extensionRoot}?opened=with-tabs-update`);
      await urlInput.blur();
      await link
        .locator("label", {
          hasText: "Use browser extension API to open link",
        })
        .locator('input[type="checkbox"]')
        .check();
      await closeSettings(page);
      await page.locator(".Links .Link").click();
      await expect(page).toHaveURL(`${extensionRoot}?opened=with-tabs-update`);

      await openSettings(page);
      await expandWidgetSettings(page, "Quick Links");
      const reopened = widgetSettingsFieldset(page, "Quick Links");
      const reopenedLink = reopened.locator(".LinkInput").first();
      await reopenedLink.locator('input[type="url"]').fill("chrome://settings");
      await reopenedLink.locator('input[type="url"]').blur();
      await reopenedLink
        .locator("label", {
          hasText: "Use browser extension API to open link",
        })
        .locator('input[type="checkbox"]')
        .uncheck();
      await reopened
        .locator("label", { hasText: "Links open in a new tab" })
        .locator('input[type="checkbox"]')
        .check();
      await closeSettings(page);

      const newTabPromise = context.waitForEvent("page");
      await page.locator(".Links .Link").click();
      const settingsPage = await newTabPromise;
      await settingsPage.waitForLoadState("domcontentloaded");
      expect(settingsPage.url()).toMatch(/^chrome:\/\/settings/);
    } finally {
      await closeExtension(session);
    }
  });

  test("keeps a remote Iconify icon after an offline reload", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      await link.locator("select").first().selectOption("iconify");
      await link
        .locator("label", { hasText: "Custom Iconify Icon" })
        .locator('input[type="text"]')
        .fill("solar:home-bold");
      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();
      await closeSettings(page);

      // Extension settings are intentionally batched for one second. Wait for
      // the link itself to be durable so this test isolates the icon cache.
      await page.waitForTimeout(1100);

      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.clearBrowserCache");
      await context.setOffline(true);
      await page.reload();

      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();
    } finally {
      await closeExtension(session);
    }
  });

  test("searches every Iconify set from the picker", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      await context.route("https://api.iconify.design/collections", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            solar: { name: "Solar", total: 1, category: "General" },
          }),
        }),
      );
      await context.route("https://api.iconify.design/search?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            icons: ["solar:home-bold"],
            total: 1,
          }),
        }),
      );
      await context.route("https://api.iconify.design/collection?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            prefix: "solar",
            total: 2,
            uncategorized: ["home-bold"],
            categories: { Nature: ["moon-bold"] },
          }),
        }),
      );
      await context.route("https://api.iconify.design/solar.json?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            prefix: "solar",
            width: 24,
            height: 24,
            icons: {
              "home-bold": {
                body: '<path d="M3 11 12 3l9 8v10H3Z" fill="currentColor"/>',
              },
              "moon-bold": {
                body: '<path d="M20 16A8 8 0 0 1 8 4a8 8 0 1 0 12 12Z" fill="currentColor"/>',
              },
            },
          }),
        }),
      );

      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      await link.locator("select").first().selectOption("feather");
      await link.getByRole("button", { name: "Open icon picker" }).click();

      const modal = page.locator(".IconPickerModal");
      await expect(
        modal.getByRole("button", { name: "Show more" }),
      ).toHaveCount(0);
      await modal.getByLabel("Icon set").selectOption("all");
      await expect(modal.getByText("Enter a search term")).toBeVisible();
      await modal.getByPlaceholder("Search all icon sets...").fill("home");
      await modal.getByRole("button", { name: "home bold, Solar" }).click();

      await expect(modal).toHaveCount(0);
      await expect(link.locator("select").first()).toHaveValue("iconify");
      await expect(
        link
          .locator("label", { hasText: "Custom Iconify Icon" })
          .locator('input[type="text"]'),
      ).toHaveValue("solar:home-bold");
      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();

      await link.getByRole("button", { name: "Open icon picker" }).click();
      await modal.getByLabel("Icon set").selectOption("solar");
      await modal.getByRole("button", { name: "moon bold, Solar" }).click();
      await expect(
        link
          .locator("label", { hasText: "Custom Iconify Icon" })
          .locator('input[type="text"]'),
      ).toHaveValue("solar:moon-bold");
    } finally {
      await closeExtension(session);
    }
  });

  test("requests the optional bookmarks permission through Chrome", async () => {
    const session = await launchExtension();
    const { page } = session;

    try {
      const settings = await addQuickLinks(page);
      await page.evaluate(() => {
        const extensionWindow = window as ExtensionWindow;
        extensionWindow.__e2ePermissionRequests = [];
        const originalRequest = extensionWindow.chrome.permissions.request.bind(
          extensionWindow.chrome.permissions,
        );
        extensionWindow.chrome.permissions.request = (details, callback) => {
          extensionWindow.__e2ePermissionRequests?.push(details);
          return originalRequest(details, callback);
        };
      });

      expect(
        await page.evaluate(() =>
          (window as ExtensionWindow).chrome.permissions.contains({
            permissions: ["bookmarks"],
          }),
        ),
      ).toBe(false);

      const requestPermission = settings.getByRole("button", {
        name: "Request Permission",
      });
      await requestPermission.click();
      await expect
        .poll(() =>
          page.evaluate(
            () => (window as ExtensionWindow).__e2ePermissionRequests,
          ),
        )
        .toEqual([{ permissions: ["bookmarks"] }]);

      // Chrome owns the native Allow/Deny sheet from here. Playwright does not
      // expose extension permission prompts, so the E2E stops at the real API
      // boundary instead of mutating the manifest or faking a grant.
      expect(
        await page.evaluate(() =>
          (window as ExtensionWindow).chrome.permissions.contains({
            permissions: ["bookmarks"],
          }),
        ),
      ).toBe(false);
    } finally {
      await closeExtension(session);
    }
  });

  test("imports a recursive bookmark folder after permission is granted", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      await context.addInitScript(() => {
        const extensionWindow = window as ExtensionWindow;
        const nestedBookmark: BookmarkTreeNodeFixture = {
          id: "e2e-nested-bookmark",
          title: "Nested bookmark",
          url: "https://example.com/nested",
        };
        const importFolder: BookmarkTreeNodeFixture = {
          id: "e2e-import-folder",
          title: "E2E Import",
          children: [
            {
              id: "e2e-first-bookmark",
              title: "First bookmark",
              url: "https://example.com/first",
            },
            {
              id: "e2e-nested-folder",
              title: "Nested folder",
              children: [nestedBookmark],
            },
          ],
        };
        const root: BookmarkTreeNodeFixture = {
          id: "0",
          title: "",
          children: [importFolder],
        };

        extensionWindow.chrome.permissions.contains = (_details, callback) => {
          if (callback) {
            callback(true);
            return;
          }
          return Promise.resolve(true);
        };
        const bookmarksApi: ChromeExtensionApi["bookmarks"] = {
          getTree: (callback) => {
            const result = [root];
            if (callback) {
              callback(result);
              return;
            }
            return Promise.resolve(result);
          },
          getSubTree: (id, callback) => {
            const result = id === importFolder.id ? [importFolder] : [];
            if (callback) {
              callback(result);
              return;
            }
            return Promise.resolve(result);
          },
        };
        extensionWindow.chrome.bookmarks = bookmarksApi;
        extensionWindow.browser.bookmarks = bookmarksApi;
      });
      await page.reload();
      await expect(page.locator(".Dashboard")).toBeVisible();

      const settings = await addQuickLinks(page);
      await expect(
        settings.getByText("Bookmarks permission is required to import."),
      ).toHaveCount(0);

      const folderSelect = settings
        .getByText("Select folder")
        .locator("select");
      const folderOption = folderSelect.locator("option", {
        hasText: "E2E Import",
      });
      await expect(folderOption).toHaveCount(1);
      const folderId = await folderOption.getAttribute("value");
      expect(folderId).toBe("e2e-import-folder");

      await folderSelect.selectOption(folderId!);
      await settings
        .getByRole("button", { name: "Import", exact: true })
        .click();
      await expect(settings.getByText("Imported 2 links")).toBeVisible();

      await closeSettings(page);
      await expect(page.locator(".Links .Link-name")).toContainText([
        "TablissNG",
        "First bookmark",
        "Nested bookmark",
      ]);
      await expect(
        page.locator('.Links .Link[href="https://example.com/first"]'),
      ).toBeVisible();
      await expect(
        page.locator('.Links .Link[href="https://example.com/nested"]'),
      ).toBeVisible();

      await page.waitForTimeout(1100);
      await page.reload();
      await expect(page.locator(".Dashboard")).toBeVisible();
      await expect(page.locator(".Links .Link-name")).toContainText([
        "TablissNG",
        "First bookmark",
        "Nested bookmark",
      ]);
    } finally {
      await closeExtension(session);
    }
  });
});
