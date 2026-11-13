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
    await page.clock.pauseAt(new Date());
    await input.pressSequentially("tabliss", { delay: 20 });
    await page.clock.runFor(199);
    await page.waitForTimeout(30);
    expect(queries).toEqual([]);
    await page.clock.runFor(1);
    await expect(results).toHaveValue("tabliss");
    await page.clock.resume();
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

test("a pending permission grant preserves newer settings", async () => {
  const session = await launchSearch();
  const { page, provider } = session;
  try {
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    await page.evaluate(() => {
      chrome.permissions.contains = async () => true;
      chrome.permissions.request = async () =>
        new Promise<boolean>((resolve) => {
          (
            window as Window & { resolvePermission?: (value: boolean) => void }
          ).resolvePermission = resolve;
        });
    });

    await provider.selectOption("bing");
    await page.waitForFunction(
      () =>
        typeof (
          window as Window & {
            resolvePermission?: (value: boolean) => void;
          }
        ).resolvePermission === "function",
    );
    const placeholder = widgetSettingsFieldset(page, "Search")
      .locator("label", { hasText: "Placeholder Text" })
      .locator("input");
    await placeholder.fill("Updated while permission was pending");
    await page.evaluate(() => {
      (
        window as Window & { resolvePermission?: (value: boolean) => void }
      ).resolvePermission?.(true);
    });
    await page.waitForTimeout(100);
    await expect(provider).toHaveValue("bing");
    await closeSettings(page);
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    await expect(placeholder).toHaveValue(
      "Updated while permission was pending",
    );
  } finally {
    await closeExtension(session);
  }
});

test("an obsolete permission grant cannot replace a newer provider", async () => {
  const session = await launchSearch();
  const { page, provider } = session;
  try {
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    await page.evaluate(() => {
      chrome.permissions.contains = async () => true;
      chrome.permissions.request = async (details) => {
        if (details.origins?.[0] !== "https://api.bing.com/*") return true;
        return new Promise<boolean>((resolve) => {
          (
            window as Window & { resolveBing?: (value: boolean) => void }
          ).resolveBing = resolve;
        });
      };
    });
    await provider.selectOption("bing");
    await page.waitForFunction(
      () =>
        typeof (window as Window & { resolveBing?: (value: boolean) => void })
          .resolveBing === "function",
    );
    await provider.selectOption("duckduckgo");
    await expect(provider).toHaveValue("duckduckgo");
    await page.evaluate(() => {
      (
        window as Window & { resolveBing: (value: boolean) => void }
      ).resolveBing(true);
    });
    await page.waitForTimeout(100);
    await expect(provider).toHaveValue("duckduckgo");
  } finally {
    await closeExtension(session);
  }
});

test("out-of-order permission checks do not resurrect a retry notice", async () => {
  const session = await launchSearch();
  const { page } = session;
  try {
    await page.evaluate(() => {
      chrome.permissions.contains = async () => true;
    });
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    await page.waitForTimeout(100);
    await page.evaluate(() => {
      const pending = window as Window & {
        permissionChecks?: Array<(value: boolean) => void>;
      };
      pending.permissionChecks = [];
      chrome.permissions.contains = (_details, callback) =>
        new Promise<boolean>((resolve) => {
          pending.permissionChecks!.push((granted) => {
            callback?.(granted);
            resolve(granted);
          });
        });
    });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForFunction(
      () =>
        (window as Window & { permissionChecks?: unknown[] }).permissionChecks!
          .length >= 1,
    );
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForFunction(
      () =>
        (window as Window & { permissionChecks?: unknown[] }).permissionChecks!
          .length >= 2,
    );
    await page.evaluate(() => {
      const checks = (
        window as Window & {
          permissionChecks: Array<(value: boolean) => void>;
        }
      ).permissionChecks;
      checks[checks.length - 1](true);
      checks.slice(0, -1).forEach((check) => check(false));
    });
    await page.waitForTimeout(100);
    await expect(
      widgetSettingsFieldset(page, "Search").getByRole("button", {
        name: "Request access",
      }),
    ).toHaveCount(0);
  } finally {
    await closeExtension(session);
  }
});

test("changing suggestion quantity refreshes an existing query", async () => {
  const session = await launchSearch();
  const { page, input, results } = session;
  try {
    const queries: string[] = [];
    await page.route(suggestionUrl, async (route) => {
      const query = new URL(route.request().url()).searchParams.get("q")!;
      queries.push(query);
      await route.fulfill({ json: [query, ["First", "Second", "Third"]] });
    });
    await input.fill("refresh");
    await expect(results).toHaveCount(3);
    await openSettings(page);
    await expandWidgetSettings(page, "Search");
    const quantity = widgetSettingsFieldset(page, "Search")
      .locator("label", { hasText: "Suggestion Quantity" })
      .locator('input[type="number"]');
    await quantity.fill("1");
    await closeSettings(page);
    await expect(results).toHaveCount(1);
    await expect(results.first()).toHaveValue("First");
    expect(queries).toEqual(["refresh", "refresh"]);
  } finally {
    await closeExtension(session);
  }
});
