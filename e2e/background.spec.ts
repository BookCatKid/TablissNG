import { expect, test } from "@playwright/test";

import { closeSettings, selectBackground } from "./helpers";

test.describe("Background", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("selects a solid colour background", async ({ page }) => {
    await selectBackground(page, "background/colour");
    await closeSettings(page);

    const colour = page.locator(".Background .Colour");
    await expect(colour).toBeVisible();
    // Each test gets a fresh context, so the widget is always at its default
    // colour (#3498db) — assert the exact value.
    await expect(colour).toHaveCSS("background-color", "rgb(52, 152, 219)");
  });
});
