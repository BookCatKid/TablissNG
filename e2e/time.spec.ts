import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { closeSettings, expandWidgetSettings, openSettings } from "./helpers";

test.describe("Time date format", () => {
  test.use({ timezoneId: "UTC" });

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-01T00:30:00Z"));
    await page.goto("/");
    await openSettings(page);
    await expandWidgetSettings(page, "Time");
  });

  test("keeps long names by default and persists the short format", async ({
    page,
  }) => {
    const settings = page.locator(".TimeSettings");
    const date = page.locator(".Time h3");
    const shortDate = settings.getByLabel("Short date format");

    await expect(shortDate).toHaveCount(0);
    await settings.getByLabel("Display date", { exact: true }).check();
    await expect(shortDate).not.toBeChecked();
    await expect(date).toHaveText("Thursday, October 1");

    await shortDate.check();
    await expect(date).toHaveText("Thu, Oct 1");
    await closeSettings(page);
    await page.reload();
    await expect(date).toHaveText("Thu, Oct 1");

    await openSettings(page);
    await expandWidgetSettings(page, "Time");
    await expect(shortDate).toBeChecked();
    await shortDate.uncheck();
    await expect(date).toHaveText("Thursday, October 1");
    await settings.getByLabel("Display date", { exact: true }).uncheck();
    await expect(date).toHaveCount(0);
    await expect(shortDate).toHaveCount(0);
  });

  test("uses the selected time zone and locale in analogue and date-only modes", async ({
    page,
  }) => {
    const settings = page.locator(".TimeSettings");
    const date = page.locator(".Time h3");

    await settings.getByLabel("Display date", { exact: true }).check();
    await settings.getByLabel("Short date format").check();
    await settings.getByRole("combobox").selectOption("America/Los_Angeles");
    await expect(date).toHaveText("Wed, Sep 30");

    await settings.getByLabel("Analogue", { exact: true }).check();
    await expect(page.locator(".Time.Analogue svg")).toBeVisible();
    await expect(date).toHaveText("Wed, Sep 30");
    await settings.getByLabel("Display time", { exact: true }).uncheck();
    await expect(page.locator(".Time.Analogue")).toHaveCount(0);
    await expect(settings.getByLabel("Show Separator")).toHaveCount(0);
    await expect(settings.getByLabel("Short date format")).toBeChecked();
    await expect(date).toHaveText("Wed, Sep 30");

    await page.locator('label:has-text("Language") select').selectOption("fr");
    await expect(date).toHaveText("mer. 30 sept.");
    await settings.getByLabel("Short date format").uncheck();
    await expect(date).toHaveText("mercredi 30 septembre");
  });

  test("exports the format and accepts settings without the option", async ({
    page,
  }) => {
    const settings = page.locator(".TimeSettings");
    await settings.getByLabel("Display date", { exact: true }).check();
    await settings.getByLabel("Short date format").check();

    const downloadPromise = page.waitForEvent("download");
    await page
      .locator(".Settings a")
      .filter({ hasText: /^export$/i })
      .click();
    const download = await downloadPromise;
    const exported = JSON.parse(
      await readFile((await download.path())!, "utf8"),
    );
    expect(exported["data/default-time"].shortDate).toBe(true);
    delete exported["data/default-time"].shortDate;

    const chooserPromise = page.waitForEvent("filechooser");
    await page
      .locator(".Settings a")
      .filter({ hasText: /^import$/i })
      .click();
    await (
      await chooserPromise
    ).setFiles({
      name: "settings.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(exported)),
    });

    await expect(page.locator(".Time h3")).toHaveText("Thursday, October 1");
    await expect(settings.getByLabel("Short date format")).not.toBeChecked();
    await settings.getByLabel("Short date format").check();
    await expect(page.locator(".Time h3")).toHaveText("Thu, Oct 1");
  });
});
