import { expect, type Page } from "@playwright/test";

/**
 * Open the settings panel by clicking the gear icon in the dashboard overlay.
 * Waits for the Settings panel to be visible.
 */
export async function openSettings(page: Page): Promise<void> {
  // If settings are already open, do nothing.
  if (await page.locator(".Settings .plane").isVisible()) return;
  // The settings cog is identified by its title attribute.
  await page
    .locator('.Overlay button[title^="Customise Tabliss"]')
    .first()
    .click();
  await expect(page.locator(".Settings .plane")).toBeVisible();
}

/**
 * Close the settings panel by pressing Escape.
 */
export async function closeSettings(page: Page): Promise<void> {
  // Blur first: the app ignores key shortcuts while an input is focused.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("Escape");
  await expect(page.locator(".Settings .plane")).toBeHidden();
}

/**
 * Locate the section <div> in settings that contains an <h2> with the given
 * heading text (e.g. "Background", "Widgets", "Settings").
 */
export function settingsSection(page: Page, heading: string) {
  return page.locator("div", {
    has: page.locator("h2", { hasText: heading }),
  });
}

/**
 * Open settings and pick a background plugin by its option value
 * (e.g. "background/image", "background/colour").
 */
export async function selectBackground(
  page: Page,
  value: string,
): Promise<void> {
  await openSettings(page);
  await settingsSection(page, "Background")
    .locator("select.primary")
    .first()
    .selectOption(value);
}

/**
 * Open settings and add a widget by its option value
 * (e.g. "widget/notes", "widget/tallyCounter").
 */
export async function addWidget(page: Page, value: string): Promise<void> {
  await openSettings(page);
  await settingsSection(page, "Widgets")
    .locator("> label > select.primary")
    .selectOption(value);
}

/**
 * Locate the settings <fieldset> for an existing widget by its display name.
 */
export function widgetSettingsFieldset(page: Page, widgetName: string) {
  return page.locator("fieldset", { hasText: widgetName });
}

/**
 * Expand a widget's settings fieldset (clicks the heading to reveal options).
 */
export async function expandWidgetSettings(
  page: Page,
  widgetName: string,
): Promise<void> {
  await widgetSettingsFieldset(page, widgetName).locator("h4").first().click();
}
