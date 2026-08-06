import { expect, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  widgetSettingsFieldset,
} from "./helpers";

test.describe("Widgets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the default time and greeting widgets", async ({ page }) => {
    // .Time matches both the wrapper and the inner .Time.Digital clock.
    await expect(page.locator(".Time").first()).toBeVisible();
    await expect(page.locator(".Greeting")).toBeVisible();
  });

  test("adds a tally counter widget and increments the count", async ({
    page,
  }) => {
    await addWidget(page, "widget/tallyCounter");
    await closeSettings(page);

    const counter = page.locator(".TallyCounter");
    await expect(counter).toBeVisible();

    const count = counter.locator(".count");
    await expect(count).toHaveText("0");

    // The last control button is the increment button.
    await counter.locator(".control-btn").last().click();
    await expect(count).toHaveText("1");
  });

  test("removes a widget from settings", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    const fieldset = widgetSettingsFieldset(page, "Tally Counter");
    await expect(fieldset).toHaveCount(1);

    await fieldset.locator('button[title="Remove widget"]').click();
    await expect(fieldset).toHaveCount(0);
  });

  test("notes widget stores typed text", async ({ page }) => {
    await addWidget(page, "widget/notes");
    await closeSettings(page);

    const notes = page.locator(".Notes");
    await expect(notes).toBeVisible();

    await notes.click();
    const editor = page.locator(".Notes [contenteditable]");
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.type("Hello e2e");
    await page.keyboard.press("Escape");

    await expect(notes).toContainText("Hello e2e");
  });

  test("todo widget adds an item", async ({ page }) => {
    await addWidget(page, "widget/todo");
    await closeSettings(page);

    const todo = page.locator(".Todo");
    await expect(todo).toBeVisible();

    // The bottom control row's first link adds a new item.
    await todo.locator("> div").nth(1).locator("a").first().click();
    await expect(page.locator(".TodoItem")).toHaveCount(1);
    // The empty editable span has zero size (reported hidden) — focus directly.
    await page.locator(".TodoItem [contenteditable]").focus();
    await page.keyboard.type("Buy milk");
    await page.keyboard.press("Enter");

    await expect(page.locator(".TodoItem")).toContainText("Buy milk");
  });

  test("custom text widget shows the configured text", async ({ page }) => {
    await addWidget(page, "widget/customText");
    await expandWidgetSettings(page, "Custom Text");
    await widgetSettingsFieldset(page, "Custom Text")
      .locator("textarea")
      .fill("Hello e2e");
    await closeSettings(page);

    await expect(page.locator(".CustomText h3")).toHaveText("Hello e2e");
  });

  test("search widget renders a search input", async ({ page }) => {
    await addWidget(page, "widget/search");
    await closeSettings(page);

    await expect(page.locator('.Search input[type="text"]')).toBeVisible();
  });

  test("reorders widgets in settings", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await addWidget(page, "widget/notes");

    const order = () =>
      page
        .locator("fieldset.Widget h4")
        .allTextContents()
        .then((texts) => texts.map((t) => t.trim()));

    // The default time/greeting widgets also appear in the list.
    let names = await order();
    expect(names.indexOf("Tally Counter")).toBeLessThan(names.indexOf("Notes"));

    await widgetSettingsFieldset(page, "Tally Counter")
      .locator('button[title="Move widget down"]')
      .click();

    names = await order();
    expect(names.indexOf("Tally Counter")).toBeGreaterThan(
      names.indexOf("Notes"),
    );
  });
});
