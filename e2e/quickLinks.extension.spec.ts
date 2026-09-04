import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

type ExtensionSession = {
  context: BrowserContext;
  page: Page;
  profilePath: string;
  extensionPath?: string;
};

type ChromeExtensionApi = {
  permissions: {
    contains(details: { permissions: string[] }): Promise<boolean>;
  };
  bookmarks: {
    create(details: {
      title: string;
      parentId?: string;
      url?: string;
    }): Promise<{ id: string }>;
  };
};

type ExtensionWindow = Window & { chrome: ChromeExtensionApi };

async function launchExtension(
  bookmarksRequired = false,
): Promise<ExtensionSession> {
  const sourcePath = path.resolve("dist/chromium");
  let extensionPath = sourcePath;

  if (bookmarksRequired) {
    extensionPath = await mkdtemp(path.join(tmpdir(), "tablissng-extension-"));
    await cp(sourcePath, extensionPath, { recursive: true });
    const manifestPath = path.join(extensionPath, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.optional_permissions = manifest.optional_permissions.filter(
      (permission: string) => permission !== "bookmarks",
    );
    manifest.permissions.push("bookmarks");
    await writeFile(manifestPath, JSON.stringify(manifest));
  }

  const profilePath = await mkdtemp(path.join(tmpdir(), "tablissng-profile-"));
  const context = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("chrome://newtab");
  await expect(page.locator(".Dashboard")).toBeVisible();

  return {
    context,
    page,
    profilePath,
    extensionPath: bookmarksRequired ? extensionPath : undefined,
  };
}

async function closeExtension(session: ExtensionSession): Promise<void> {
  await session.context.close();
  await rm(session.profilePath, { recursive: true, force: true });
  if (session.extensionPath) {
    await rm(session.extensionPath, { recursive: true, force: true });
  }
}

async function addQuickLinks(page: Page) {
  await addWidget(page, "widget/links");
  await expandWidgetSettings(page, "Quick Links");
  return widgetSettingsFieldset(page, "Quick Links");
}

test.describe("Quick Links extension integration", () => {
  test("shows the optional bookmarks permission gate", async () => {
    const session = await launchExtension();
    const { page } = session;

    try {
      const settings = await addQuickLinks(page);
      await expect(
        settings.getByText("Bookmarks permission is required to import."),
      ).toBeVisible();
      await expect(
        settings.getByRole("button", { name: "Request Permission" }),
      ).toBeEnabled();
      expect(
        await page.evaluate(() =>
          (window as ExtensionWindow).chrome.permissions.contains({
            permissions: ["bookmarks"],
          }),
        ),
      ).toBe(false);
    } finally {
      await closeExtension(session);
    }
  });

  test("uses browser tabs for opted-in and restricted URLs", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      const urlInput = link.locator('input[type="url"]');
      const extensionRoot = page.url().split("?")[0];

      await urlInput.fill(`${extensionRoot}?opened=with-tabs-update`);
      await urlInput.blur();
      await link
        .locator("label", {
          hasText: "Use browser extension API to open link",
        })
        .locator('input[type="checkbox"]')
        .check();
      await closeSettings(page);
      await page.locator(".Links .Link").click();
      await expect(page).toHaveURL(`${extensionRoot}?opened=with-tabs-update`);

      await openSettings(page);
      await expandWidgetSettings(page, "Quick Links");
      const reopened = widgetSettingsFieldset(page, "Quick Links");
      const reopenedLink = reopened.locator(".LinkInput").first();
      await reopenedLink.locator('input[type="url"]').fill("chrome://settings");
      await reopenedLink.locator('input[type="url"]').blur();
      await reopenedLink
        .locator("label", {
          hasText: "Use browser extension API to open link",
        })
        .locator('input[type="checkbox"]')
        .uncheck();
      await reopened
        .locator("label", { hasText: "Links open in a new tab" })
        .locator('input[type="checkbox"]')
        .check();
      await closeSettings(page);

      const newTabPromise = context.waitForEvent("page");
      await page.locator(".Links .Link").click();
      const settingsPage = await newTabPromise;
      await settingsPage.waitForLoadState("domcontentloaded");
      expect(settingsPage.url()).toMatch(/^chrome:\/\/settings/);
    } finally {
      await closeExtension(session);
    }
  });

  test("keeps a remote Iconify icon after an offline reload", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      await link.locator("select").first().selectOption("iconify");
      await link
        .locator("label", { hasText: "Custom Iconify Icon" })
        .locator('input[type="text"]')
        .fill("solar:home-bold");
      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();
      await closeSettings(page);

      // Extension settings are intentionally batched for one second. Wait for
      // the link itself to be durable so this test isolates the icon cache.
      await page.waitForTimeout(1100);

      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.clearBrowserCache");
      await context.setOffline(true);
      await page.reload();

      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();
    } finally {
      await closeExtension(session);
    }
  });

  test("searches every Iconify set from the picker", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    try {
      await context.route("https://api.iconify.design/collections", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            solar: { name: "Solar", total: 1, category: "General" },
          }),
        }),
      );
      await context.route("https://api.iconify.design/search?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            icons: ["solar:home-bold"],
            total: 1,
          }),
        }),
      );
      await context.route("https://api.iconify.design/collection?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            prefix: "solar",
            total: 2,
            uncategorized: ["home-bold"],
            categories: { Nature: ["moon-bold"] },
          }),
        }),
      );
      await context.route("https://api.iconify.design/solar.json?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            prefix: "solar",
            width: 24,
            height: 24,
            icons: {
              "home-bold": {
                body: '<path d="M3 11 12 3l9 8v10H3Z" fill="currentColor"/>',
              },
              "moon-bold": {
                body: '<path d="M20 16A8 8 0 0 1 8 4a8 8 0 1 0 12 12Z" fill="currentColor"/>',
              },
            },
          }),
        }),
      );

      const settings = await addQuickLinks(page);
      const link = settings.locator(".LinkInput").first();
      await link.locator("select").first().selectOption("feather");
      await link.getByRole("button", { name: "Open icon picker" }).click();

      const modal = page.locator(".IconPickerModal");
      await expect(
        modal.getByRole("button", { name: "Show more" }),
      ).toHaveCount(0);
      await modal.getByLabel("Icon set").selectOption("all");
      await expect(modal.getByText("Enter a search term")).toBeVisible();
      await modal.getByPlaceholder("Search all icon sets...").fill("home");
      await modal.getByRole("button", { name: "home bold, Solar" }).click();

      await expect(modal).toHaveCount(0);
      await expect(link.locator("select").first()).toHaveValue("iconify");
      await expect(
        link
          .locator("label", { hasText: "Custom Iconify Icon" })
          .locator('input[type="text"]'),
      ).toHaveValue("solar:home-bold");
      await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();

      await link.getByRole("button", { name: "Open icon picker" }).click();
      await modal.getByLabel("Icon set").selectOption("solar");
      await modal.getByRole("button", { name: "moon bold, Solar" }).click();
      await expect(
        link
          .locator("label", { hasText: "Custom Iconify Icon" })
          .locator('input[type="text"]'),
      ).toHaveValue("solar:moon-bold");
    } finally {
      await closeExtension(session);
    }
  });

  test("imports a recursive real bookmark folder", async () => {
    const session = await launchExtension(true);
    const { page } = session;

    try {
      await page.evaluate(async () => {
        const bookmarks = (window as ExtensionWindow).chrome.bookmarks;
        const parent = await bookmarks.create({ title: "E2E Import" });
        await bookmarks.create({
          parentId: parent.id,
          title: "First bookmark",
          url: "https://example.com/first",
        });
        const child = await bookmarks.create({
          parentId: parent.id,
          title: "Nested folder",
        });
        await bookmarks.create({
          parentId: child.id,
          title: "Nested bookmark",
          url: "https://example.com/nested",
        });
      });

      const settings = await addQuickLinks(page);
      await expect(
        settings.getByText("Bookmarks permission is required to import."),
      ).toHaveCount(0);
      const folderSelect = settings
        .getByText("Select folder")
        .locator("select");
      const folderId = await folderSelect
        .locator("option", { hasText: "E2E Import" })
        .getAttribute("value");
      expect(folderId).not.toBeNull();
      await folderSelect.selectOption(folderId!);
      await settings
        .getByRole("button", { name: "Import", exact: true })
        .click();

      await expect(settings.getByText("Imported 2 links")).toBeVisible();
      await closeSettings(page);
      await expect(page.locator(".Links .Link-name")).toContainText([
        "TablissNG",
        "First bookmark",
        "Nested bookmark",
      ]);
      await expect(
        page.locator('.Links .Link[href="https://example.com/first"]'),
      ).toBeVisible();
      await expect(
        page.locator('.Links .Link[href="https://example.com/nested"]'),
      ).toBeVisible();
    } finally {
      await closeExtension(session);
    }
  });
});
