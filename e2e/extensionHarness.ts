import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
} from "@playwright/test";

export type ExtensionSession = {
  context: BrowserContext;
  page: Page;
  profilePath: string;
};

export async function launchExtension(): Promise<ExtensionSession> {
  const extensionPath = path.resolve("dist/chromium");
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

  return { context, page, profilePath };
}

export async function closeExtension(session: ExtensionSession): Promise<void> {
  await session.context.close();
  await rm(session.profilePath, { recursive: true, force: true });
}
