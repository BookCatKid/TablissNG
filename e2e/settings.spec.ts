import { expect, test } from "@playwright/test";

import { openSettings } from "./helpers";

test.describe("System settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openSettings(page);
  });

  test("switches the UI language to French", async ({ page }) => {
    await page.locator('label:has-text("Language") select').selectOption("fr");
    // Regex avoids matching on the exact apostrophe character in the translation.
    await expect(
      page.locator(".Settings h2", { hasText: /arrière-plan/ }),
    ).toBeVisible();
    await expect(
      page.locator(".Settings h2", { hasText: "Background" }),
    ).toHaveCount(0);
  });

  test("switches the theme to dark and back to light", async ({ page }) => {
    await page.locator('label:has-text("Theme") select').selectOption("dark");
    await expect(page.locator("body")).toHaveClass(/dark/);

    await page.locator('label:has-text("Theme") select').selectOption("light");
    await expect(page.locator("body")).not.toHaveClass(/dark/);
  });

  test("changes the accent colour and resets it", async ({ page }) => {
    const accent = page.locator(
      'label:has-text("Accent Color") input[type="color"]',
    );
    await expect(accent).toHaveValue("#3498db");

    await accent.fill("#ff0000");
    await expect(accent).toHaveValue("#ff0000");

    await page.locator('label:has-text("Accent Color") button').click();
    await expect(accent).toHaveValue("#3498db");
  });

  test("moves the settings icon to the bottom right", async ({ page }) => {
    // Position buttons render in order: topLeft, topCentre, topRight,
    // bottomLeft, bottomCentre, bottomRight.
    await page.locator(".PositionInput button").nth(5).click();
    await expect(page.locator(".Overlay")).toHaveClass(/bottomRight/);
  });

  test("hides the settings toolbar", async ({ page }) => {
    await page
      .locator('label:has-text("Hide Settings Toolbar") input[type="checkbox"]')
      .check();
    await expect(page.locator(".Overlay")).toHaveClass(/hidden/);
  });

  test("auto-hides the settings menu until hovered", async ({ page }) => {
    await page
      .locator(
        'label:has-text("Auto-hide Settings Menu") input[type="checkbox"]',
      )
      .check();
    await expect(page.locator(".settings-hover-area")).toBeVisible();
  });

  test("shows the storage persistence panel on the web build", async ({
    page,
  }) => {
    await expect(page.locator(".Settings .plane")).toContainText(
      "Persist Settings",
    );
  });
});
