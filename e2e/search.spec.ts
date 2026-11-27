import { expect, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

test.beforeEach(async ({ page, context }) => {
  await context.route("https://search.example/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Search results" }),
  );
  await page.goto("/");
  await addWidget(page, "widget/search");
  await expandWidgetSettings(page, "Search");
  const settings = widgetSettingsFieldset(page, "Search");
  await settings
    .locator("label", { hasText: "Search Provider" })
    .locator("select")
    .selectOption("CUSTOM");
  await settings
    .getByLabel("Custom Search Provider", { exact: true })
    .fill("https://search.example/?q={searchTerms}");
});

test("searches in the current tab by default", async ({ page, context }) => {
  await expect(
    page.getByLabel("Open search results in a new tab"),
  ).not.toBeChecked();
  await closeSettings(page);
  await page.locator('.Search input[type="text"]').fill("tabs & café");
  await page.locator('.Search input[type="text"]').press("Enter");
  await expect(page).toHaveURL(
    "https://search.example/?q=tabs%20%26%20caf%C3%A9",
  );
  expect(context.pages()).toHaveLength(1);
});

test("persists new-tab searches and can return to the current tab", async ({
  page,
  context,
}) => {
  await page.getByLabel("Open search results in a new tab").check();
  await closeSettings(page);
  await page.reload();
  await openSettings(page);
  await expandWidgetSettings(page, "Search");
  await expect(
    page.getByLabel("Open search results in a new tab"),
  ).toBeChecked();
  await closeSettings(page);
  const dashboardUrl = page.url();
  const input = page.locator('.Search input[type="text"]');
  await input.fill("keep my dashboard");
  const opened = context.waitForEvent("page");
  await input.press("Enter");
  const result = await opened;
  await expect(result).toHaveURL(
    "https://search.example/?q=keep%20my%20dashboard",
  );
  await expect(page).toHaveURL(dashboardUrl);
  await expect(page.locator(".Dashboard")).toBeVisible();
  expect(await result.evaluate(() => window.opener)).toBeNull();
  expect(await result.evaluate(() => document.referrer)).toBe("");
  await result.close();

  await openSettings(page);
  await expandWidgetSettings(page, "Search");
  await page.getByLabel("Open search results in a new tab").uncheck();
  await closeSettings(page);
  await input.fill("current tab");
  await input.press("Enter");
  await expect(page).toHaveURL("https://search.example/?q=current%20tab");
  expect(context.pages()).toHaveLength(1);
});

test("opens clicked and keyboard-selected suggestions in new tabs", async ({
  page,
  context,
}) => {
  await page.getByLabel("Open search results in a new tab").check();
  await widgetSettingsFieldset(page, "Search")
    .getByLabel("Suggestions Provider")
    .selectOption("google");
  await context.route("https://www.google.com/complete/search**", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({
      contentType: "application/javascript",
      body: `${url.searchParams.get("callback")}(${JSON.stringify([url.searchParams.get("q"), ["Chosen suggestion"]])})`,
    });
  });
  await closeSettings(page);
  const dashboardUrl = page.url();
  const input = page.locator('.Search input[type="text"]');
  for (const action of ["click", "keyboard"]) {
    await input.fill(action);
    const suggestion = page.locator(".Suggestions input");
    await expect(suggestion).toHaveValue("Chosen suggestion");
    const opened = context.waitForEvent("page");
    if (action === "click") {
      await suggestion.click();
    } else {
      await input.press("ArrowDown");
      await expect(input).toHaveValue("Chosen suggestion");
      await input.press("Enter");
    }
    const result = await opened;
    await expect(result).toHaveURL(
      "https://search.example/?q=Chosen%20suggestion",
    );
    await expect(page).toHaveURL(dashboardUrl);
    await result.close();
  }
});
