import { expect, test } from "@playwright/test";

import { closeExtension, launchExtension } from "./extensionHarness";
import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

const suggestionUrl = "https://www.google.com/complete/search**";

async function launchSearch() {
  const session = await launchExtension();
  const { page } = session;
  await addWidget(page, "widget/search");
  await expandWidgetSettings(page, "Search");
  // Exercise the permission-granted path without a browser-owned prompt.
  await page.evaluate(() => {
    chrome.permissions.request = async () => true;
  });
  const provider = widgetSettingsFieldset(page, "Search")
    .locator("label", { hasText: "Suggestions Provider" })
    .locator("select");
  await provider.selectOption("google");
  await closeSettings(page);
  return {
    ...session,
    provider,
    input: page.locator('.Search input[type="text"]'),
    results: page.locator(".Suggestions input"),
  };
}

test("debounces typing and handles arrow keys after an empty response", async () => {
  const session = await launchSearch();
  const { page, input, results } = session;
  try {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const queries: string[] = [];
    await page.route(suggestionUrl, async (route) => {
      const query = new URL(route.request().url()).searchParams.get("q")!;
      queries.push(query);
      await route.fulfill({ json: [query, query === "empty" ? [] : [query]] });
    });
    await input.pressSequentially("tabliss", { delay: 20 });
    await expect(results).toHaveValue("tabliss");
    expect(queries).toEqual(["tabliss"]);
    const response = page.waitForResponse((response) =>
      response.url().includes("q=empty"),
    );
    await input.fill("empty");
    await response;
    await expect(page.locator(".Suggestions")).toHaveCount(0);
    await input.press("ArrowDown");
    await input.press("ArrowUp");
    expect(errors).toEqual([]);
    await expect(input).toHaveValue("empty");
  } finally {
    await closeExtension(session);
  }
});

test("an obsolete failed request preserves newer results", async () => {
  const session = await launchSearch();
  const { page, input, results } = session;
  try {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route(suggestionUrl, async (route) => {
      const query = new URL(route.request().url()).searchParams.get("q");
      if (query === "old") {
        await gate;
        await route.fulfill({ status: 500, body: "Failed" });
      } else {
        await route.fulfill({ json: [query, ["New result"]] });
      }
    });
    const oldRequest = page.waitForRequest((request) =>
      request.url().includes("q=old"),
    );
    await input.fill("old");
    await oldRequest;
    await input.fill("new");
    await expect(results).toHaveValue("New result");
    const oldResponse = page.waitForResponse((response) =>
      response.url().includes("q=old"),
    );
    release();
    await oldResponse;
    // Allow the rejected fetch to reach React before checking preservation.
    await page.waitForTimeout(300);
    await expect(results).toHaveValue("New result");
  } finally {
    await closeExtension(session);
  }
});

for (const action of ["disable", "escape"] as const) {
  test(`${action} discards an in-flight suggestion response`, async () => {
    const session = await launchSearch();
    const { page, input, provider } = session;
    try {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      await page.route(suggestionUrl, async (route) => {
        await gate;
        await route.fulfill({ json: ["pending", ["Late result"]] });
      });
      const request = page.waitForRequest(suggestionUrl);
      await input.fill("pending");
      await request;
      if (action === "disable") {
        await openSettings(page);
        await expandWidgetSettings(page, "Search");
        await provider.selectOption("");
        await closeSettings(page);
      } else {
        await input.press("Escape");
      }
      const response = page.waitForResponse(suggestionUrl);
      release();
      await response;
      await page.waitForTimeout(300);
      await expect(page.locator(".Suggestions")).toHaveCount(0);
    } finally {
      await closeExtension(session);
    }
  });
}

test("keeps the retry notice when switching from an allowed provider is denied", async () => {
  const session = await launchSearch();
  const { page, provider } = session;
  try {
    await page.evaluate(() => {
      chrome.permissions.contains = (details, callback) => {
        const granted = details.origins?.[0] === "https://www.google.com/*";
        callback?.(granted);
        return Promise.resolve(granted);
      };
      chrome.permissions.request = async () => false;
    });
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    await provider.selectOption("bing");
    const retry = widgetSettingsFieldset(page, "Search").getByRole("button", {
      name: "Request access",
    });
    await expect(retry).toBeVisible();
    await expect(provider).toHaveValue("google");
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    // Let the permission checks triggered by returning focus settle.
    await page.waitForTimeout(300);
    await expect(retry).toBeVisible();
    await page.evaluate(() => {
      chrome.permissions.request = async (details) => {
        const granted = details.origins?.[0] === "https://api.bing.com/*";
        if (granted) {
          chrome.permissions.contains = (_details, callback) => {
            callback?.(true);
            return Promise.resolve(true);
          };
        }
        return granted;
      };
    });
    await retry.click();
    await expect(provider).toHaveValue("bing");
    await expect(retry).toHaveCount(0);
  } finally {
    await closeExtension(session);
  }
});
