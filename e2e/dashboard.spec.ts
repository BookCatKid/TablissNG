import { expect, test } from "@playwright/test";

import { addWidget, closeSettings, openSettings } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the dashboard with overlay icons", async ({ page }) => {
    await expect(page.locator(".Dashboard")).toBeVisible();
    await expect(page.locator(".Overlay")).toBeAttached();
  });

  test("opens settings via the cog icon", async ({ page }) => {
    await openSettings(page);
    await expect(page.locator(".Settings .plane")).toBeVisible();
    await expect(
      page.locator(".Settings h2", { hasText: "Background" }),
    ).toBeVisible();
    await expect(
      page.locator(".Settings h2", { hasText: "Widgets" }),
    ).toBeVisible();
  });

  test("opens settings with the 's' keyboard shortcut", async ({ page }) => {
    await expect(page.locator(".Dashboard")).toBeVisible();
    await page.keyboard.press("s");
    await expect(page.locator(".Settings .plane")).toBeVisible();
  });

  test("closes settings with Escape", async ({ page }) => {
    await openSettings(page);
    await closeSettings(page);
  });

  test("toggles widget visibility (focus mode) with 'w'", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await closeSettings(page);
    await expect(page.locator(".TallyCounter")).toBeVisible();

    await page.keyboard.press("w");
    await expect(page.locator(".TallyCounter")).toHaveCount(0);

    await page.keyboard.press("w");
    await expect(page.locator(".TallyCounter")).toBeVisible();
  });

  test("scroll-to-top button appears after scrolling settings", async ({
    page,
  }) => {
    await openSettings(page);
    const plane = page.locator(".Settings .plane");
    await plane.evaluate((el) => el.scrollTo({ top: 1000 }));
    const scrollToTopButton = page.locator(".scroll-to-top");
    await expect(scrollToTopButton).toBeVisible();
    await scrollToTopButton.click();
    await expect
      .poll(async () => plane.evaluate((el) => el.scrollTop), {
        timeout: 2000,
      })
      .toBeLessThanOrEqual(1);
  });

  test("displays the current TablissNG version label", async ({ page }) => {
    await openSettings(page);
    await expect(
      page.locator(".Settings .plane span", { hasText: /TablissNG v/ }),
    ).toBeVisible();
  });
});
