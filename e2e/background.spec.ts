import path from "node:path";

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

  test("selects a gradient background", async ({ page }) => {
    await selectBackground(page, "background/gradient");
    await closeSettings(page);

    const gradient = page.locator(".Background .Gradient");
    await expect(gradient).toBeVisible();
    await expect(gradient).toHaveCSS("background-image", /gradient/);
  });

  test("uses a custom image URL", async ({ page }) => {
    await selectBackground(page, "background/online");
    // A 1x1 PNG as a data URL needs no network.
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    await page.locator('label:has-text("Image URL") input').fill(dataUrl);
    // The URL input is debounced (1s) before it updates the background.
    await page.waitForTimeout(1200);
    await closeSettings(page);

    // CrossFade keeps two copies of the image during transitions — use .first().
    const image = page.locator(".Background .Online .image").first();
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("background-image", /data:image/);
  });

  test("uploads media from a file", async ({ page }) => {
    // Key is background/image for backwards compatibility.
    await selectBackground(page, "background/image");
    await page
      .locator(".MediaSettings input[type='file']")
      .setInputFiles(path.join(__dirname, "fixtures", "pixel.png"));
    await expect(page.locator(".media-count")).toContainText(
      "1 media uploaded",
    );
    await closeSettings(page);

    await expect(page.locator(".Background .Image")).toBeVisible();
  });
});
