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

  test("extracts an image URL from a JSON response", async ({ page }) => {
    const apiUrl =
      "https://wallhaven.cc/api/v1/search?sorting=random&ratios=16x9,16x10&categories=010&atleast=1920x1080";
    let requestCount = 0;
    await page.route(apiUrl, (route) => {
      requestCount += 1;
      return route.fulfill({
        json: {
          data: [
            {
              path: `https://w.wallhaven.cc/full/test/wallpaper-${requestCount}.jpg`,
            },
          ],
        },
      });
    });
    await page.route(
      /https:\/\/w\.wallhaven\.cc\/full\/test\/wallpaper-\d+\.jpg/,
      (route) =>
        route.fulfill({
          path: path.join(__dirname, "fixtures", "pixel.png"),
          contentType: "image/png",
        }),
    );

    await selectBackground(page, "background/online");
    await page
      .locator('.OnlineSettings label:has-text("Image URL") input')
      .fill(apiUrl);
    await page
      .locator('.OnlineSettings label:has-text("Parse JSON Response") input')
      .check();
    await page
      .locator('.OnlineSettings label:has-text("JSON Path") input')
      .fill("data.0.path");
    await page.locator(".OnlineSettings select").selectOption("0");

    // URL and path inputs debounce before updating plugin data.
    await page.waitForTimeout(1200);
    await closeSettings(page);

    await expect.poll(() => requestCount).toBeGreaterThan(0);
    await page.waitForTimeout(250);
    const initialRequestCount = requestCount;
    expect(initialRequestCount).toBeLessThanOrEqual(2);
    await page.waitForTimeout(250);
    expect(requestCount).toBe(initialRequestCount);
    await expect(
      page.locator(
        `.Background .Online .image[style*="wallpaper-${initialRequestCount}.jpg"]`,
      ),
    ).toBeVisible();

    await page.addInitScript(() => {
      const seenUrls: string[] = [];
      Object.assign(window, { __onlineBackgroundUrls: seenUrls });

      const captureUrls = () => {
        for (const image of document.querySelectorAll<HTMLElement>(
          ".Background .Online .image",
        )) {
          const match =
            image.style.backgroundImage.match(/wallpaper-(\d+)\.jpg/);
          if (match && !seenUrls.includes(match[0])) seenUrls.push(match[0]);
        }
      };

      window.addEventListener("DOMContentLoaded", () => {
        new MutationObserver(captureUrls).observe(document.body, {
          attributes: true,
          attributeFilter: ["style"],
          childList: true,
          subtree: true,
        });
        captureUrls();
      });
    });

    await page.reload();
    await expect.poll(() => requestCount).toBeGreaterThan(initialRequestCount);
    await page.waitForTimeout(500);
    const displayedUrls = await page.evaluate(
      () =>
        (window as typeof window & { __onlineBackgroundUrls: string[] })
          .__onlineBackgroundUrls,
    );
    expect(displayedUrls).toEqual([`wallpaper-${initialRequestCount}.jpg`]);
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
