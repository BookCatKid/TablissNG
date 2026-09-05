import { expect, type Page, test } from "@playwright/test";

import { closeExtension, launchExtension } from "./extensionHarness";
import { openSettings } from "./helpers";

const STORAGE_NAME = "tabliss/config";
const LINKS_ID = "storage-e2e-links";
const LINKS_DATA_KEY = `data/${LINKS_ID}`;
const STORED_LINKS_KEY = `${STORAGE_NAME}/${LINKS_DATA_KEY}`;
const CHUNK_PREFIX = `${STORAGE_NAME}/$chunks/${encodeURIComponent(LINKS_DATA_KEY)}/`;

type SyncStorage = {
  get(keys?: null): Promise<Record<string, unknown>>;
  getBytesInUse(keys?: null): Promise<number>;
  remove(keys: string | string[]): Promise<void>;
  set(items: Record<string, unknown>): Promise<void>;
  QUOTA_BYTES: number;
};

type ExtensionWindow = Window & {
  chrome: {
    storage: {
      sync: SyncStorage;
    };
  };
};

type ChunkManifest = {
  __tablissStorage: string;
  chunks: number;
  generation: string;
};

const makeLinksData = (count: number) => ({
  columns: 5,
  links: Array.from({ length: count }, (_, index) => ({
    id: `storage-link-${index}`,
    name: `Storage link ${index}`,
    url: `https://example.com/${index}?payload=${"x".repeat(120)}`,
  })),
  visible: true,
  linkOpenStyle: false,
  linksNumbered: false,
  sortBy: "none",
  centerLinks: false,
});

const makeConfig = (linksData?: ReturnType<typeof makeLinksData>) => ({
  background: {
    id: "storage-background",
    key: "background/colour",
    display: { blur: 0, luminosity: -0.2 },
  },
  "data/storage-background": { colour: "#15161e" },
  ...(linksData
    ? {
        [LINKS_DATA_KEY]: linksData,
        [`widget/${LINKS_ID}`]: {
          id: LINKS_ID,
          key: "widget/links",
          order: 0,
          display: { position: "topCentre" },
        },
      }
    : {}),
  focus: false,
  locale: "en",
  timeZone: null,
  highlightingEnabled: true,
  hideSettingsIcon: false,
  settingsIconPosition: "topLeft",
  themePreference: "system",
  autoHideSettings: false,
  favicon: { mode: "default", url: "", data: null },
  accent: "#3498db",
  version: 3,
});

async function importConfig(page: Page, config: object): Promise<void> {
  await openSettings(page);
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Import", { exact: true }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "tablissng.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config)),
  });
}

async function readSyncStorage(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() =>
    (window as ExtensionWindow).chrome.storage.sync.get(null),
  );
}

const chunkKeys = (
  stored: Record<string, unknown>,
  generation?: string,
): string[] => {
  const prefix = generation
    ? `${CHUNK_PREFIX}${encodeURIComponent(generation)}/`
    : CHUNK_PREFIX;
  return Object.keys(stored)
    .filter((key) => key.startsWith(prefix))
    .sort(
      (a, b) =>
        Number(a.slice(a.lastIndexOf("/") + 1)) -
        Number(b.slice(b.lastIndexOf("/") + 1)),
    );
};

const storedItemBytes = (key: string, value: unknown): number =>
  Buffer.byteLength(key, "utf8") +
  Buffer.byteLength(JSON.stringify(value), "utf8");

test.describe("Extension sync storage", () => {
  test("chunks an oversized config and restores it after reload", async () => {
    const session = await launchExtension();
    const { page } = session;
    const linksData = makeLinksData(60);

    try {
      await importConfig(page, makeConfig(linksData));

      await expect
        .poll(async () => {
          const stored = await readSyncStorage(page);
          return (stored[STORED_LINKS_KEY] as ChunkManifest | undefined)
            ?.chunks;
        })
        .toBeGreaterThan(1);

      const stored = await readSyncStorage(page);
      const manifest = stored[STORED_LINKS_KEY] as ChunkManifest;
      const keys = chunkKeys(stored, manifest.generation);

      expect(manifest.__tablissStorage).toBe("tabliss-sync-chunks-v1");
      expect(manifest.generation).toEqual(expect.any(String));
      expect(keys).toHaveLength(manifest.chunks);
      for (const key of [STORED_LINKS_KEY, ...keys]) {
        expect(storedItemBytes(key, stored[key])).toBeLessThan(8_192);
      }

      const restored = JSON.parse(keys.map((key) => stored[key]).join(""));
      expect(restored).toEqual(linksData);

      await page.reload();
      await expect(page.locator(".Links .Link")).toHaveCount(60);
      await expect(
        page.locator('.Links .Link[href^="https://example.com/59"]'),
      ).toContainText("Storage link 59");
    } finally {
      await closeExtension(session);
    }
  });

  test("removes stale chunks when data shrinks or is deleted", async () => {
    const session = await launchExtension();
    const { page } = session;

    try {
      await importConfig(page, makeConfig(makeLinksData(60)));
      await expect
        .poll(async () => chunkKeys(await readSyncStorage(page)).length)
        .toBeGreaterThan(1);

      const smallData = makeLinksData(1);
      await importConfig(page, makeConfig(smallData));
      await expect
        .poll(async () => {
          const stored = await readSyncStorage(page);
          return {
            value: stored[STORED_LINKS_KEY],
            chunks: chunkKeys(stored).length,
          };
        })
        .toEqual({ value: smallData, chunks: 0 });

      await importConfig(page, makeConfig(makeLinksData(60)));
      await expect
        .poll(async () => chunkKeys(await readSyncStorage(page)).length)
        .toBeGreaterThan(1);

      await importConfig(page, makeConfig());
      await expect
        .poll(async () => {
          const stored = await readSyncStorage(page);
          return {
            hasValue: STORED_LINKS_KEY in stored,
            chunks: chunkKeys(stored).length,
          };
        })
        .toEqual({ hasValue: false, chunks: 0 });
    } finally {
      await closeExtension(session);
    }
  });

  test("shrinks a chunked value safely near the total sync quota", async () => {
    const session = await launchExtension();
    const { page } = session;

    try {
      await importConfig(page, makeConfig(makeLinksData(60)));
      await expect
        .poll(async () => chunkKeys(await readSyncStorage(page)).length)
        .toBeGreaterThan(1);

      const remainingBytes = await page.evaluate(async () => {
        const sync = (window as ExtensionWindow).chrome.storage.sync;
        let index = 0;

        while (true) {
          const used = await sync.getBytesInUse(null);
          const remaining = sync.QUOTA_BYTES - used;
          if (remaining < 6_000) {
            if (remaining > 400) {
              await sync.set({
                [`e2e-quota-fill-${index}`]: "x".repeat(remaining - 300),
              });
            }
            return sync.QUOTA_BYTES - (await sync.getBytesInUse(null));
          }

          await sync.set({
            [`e2e-quota-fill-${index}`]: "x".repeat(5_000),
          });
          index += 1;
        }
      });
      expect(remainingBytes).toBeLessThan(400);

      const smallData = makeLinksData(1);
      await importConfig(page, makeConfig(smallData));
      await expect
        .poll(async () => {
          const stored = await readSyncStorage(page);
          return {
            value: stored[STORED_LINKS_KEY],
            chunks: chunkKeys(stored).length,
          };
        })
        .toEqual({ value: smallData, chunks: 0 });
    } finally {
      await closeExtension(session);
    }
  });

  test("loads an existing unchunked sync item", async () => {
    const session = await launchExtension();
    const { page } = session;
    const linksData = makeLinksData(1);

    try {
      await page.evaluate(
        async ({ dataKey, data, widgetKey, widget }) => {
          await (window as ExtensionWindow).chrome.storage.sync.set({
            [dataKey]: data,
            [widgetKey]: widget,
          });
        },
        {
          dataKey: STORED_LINKS_KEY,
          data: linksData,
          widgetKey: `${STORAGE_NAME}/widget/${LINKS_ID}`,
          widget: {
            id: LINKS_ID,
            key: "widget/links",
            order: 0,
            display: { position: "topCentre" },
          },
        },
      );

      await page.reload();
      await expect(page.locator(".Links .Link")).toHaveCount(1);
      await expect(page.locator(".Links .Link").first()).toContainText(
        "Storage link 0",
      );

      const stored = await readSyncStorage(page);
      expect(stored[STORED_LINKS_KEY]).toEqual(linksData);
      expect(chunkKeys(stored)).toHaveLength(0);
    } finally {
      await closeExtension(session);
    }
  });
});
