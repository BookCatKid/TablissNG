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
