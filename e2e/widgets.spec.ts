import { expect, test } from "@playwright/test";

import { addWidget, closeSettings, widgetSettingsFieldset } from "./helpers";

test.describe("Widgets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
});
