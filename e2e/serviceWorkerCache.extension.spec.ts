import { expect, type Page, test } from "@playwright/test";

import { closeExtension, launchExtension } from "./extensionHarness";

/**
 * Regression test for https://github.com/BookCatKid/TablissNG/issues/150
 *
 * `https://api.github.com/repos/BookCatKid/tablissNG` is matched by the
 * `tabliss-cache-apis` Workbox runtime route in rspack.config.js:
 *
 *   handler: "CacheFirst"
 *   options: { cacheName: "tabliss-cache-apis",
 *              plugins: [stampResponseDate],
 *              expiration: { maxAgeSeconds: 24 * 60 * 60 } }
 *
 * Workbox's ExpirationPlugin measures an entry's age from the cached response's
 * `Date` header, and treats a response without one as fresh forever. `Date` is
 * not a CORS-safelisted response header, and the cached APIs do not expose it
 * via `Access-Control-Expose-Headers`, so the browser strips it before the
 * service worker sees the response. Without `stampResponseDate` the entry never
 * ages out and CacheFirst serves it indefinitely, which is the reported bug.
 */
const API_URL = "https://api.github.com/repos/BookCatKid/tablissNG";

const DAY_SECONDS = 24 * 60 * 60;
const AGED_SECONDS = 2 * DAY_SECONDS;

type WorkboxEntry = { id: string; url: string; timestamp: number };

/** Wait until the Workbox service worker controls the page. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller !== null),
    )
    .toBe(true);
}

/** Fetch the API URL from the page so the request goes through the service worker. */
async function fetchApi(page: Page): Promise<string> {
  return page.evaluate(async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    return response.text();
  }, API_URL);
}

/** Read the response the Workbox runtime cache is holding for the API URL. */
async function readCachedResponse(page: Page) {
  return page.evaluate(async (url) => {
    const cached = await caches.match(url);
    if (!cached) return null;
    return {
      body: await cached.clone().text(),
      date: cached.headers.get("date"),
    };
  }, API_URL);
}

/**
 * Make the cached entry look like it was stored `AGED_SECONDS` ago: age both the
 * response `Date` header Workbox reads and the timestamp it keeps in IndexedDB.
 */
async function ageCacheEntry(page: Page): Promise<void> {
  await page.evaluate(
    async ({ url, ageSeconds }) => {
      const storedDate = new Date(Date.now() - ageSeconds * 1000).toUTCString();

      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        const cached = await cache.match(url);
        if (!cached) continue;
        // Only age an existing header — adding one would hide a missing stamp.
        if (cached.headers.has("date")) {
          const headers = new Headers(cached.headers);
          headers.set("date", storedDate);
          await cache.put(
            url,
            new Response(await cached.blob(), {
              status: cached.status,
              statusText: cached.statusText,
              headers,
            }),
          );
        }
      }

      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("workbox-expiration");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const store = db
            .transaction("cache-entries", "readwrite")
            .objectStore("cache-entries");
          const all = store.getAll();
          all.onerror = () => reject(all.error);
          all.onsuccess = () => {
            for (const entry of all.result as WorkboxEntry[]) {
              if (entry.url !== url) continue;
              store.put({
                ...entry,
                timestamp: Date.now() - ageSeconds * 1000,
              });
            }
            db.close();
            resolve();
          };
        };
      });
    },
    { url: API_URL, ageSeconds: AGED_SECONDS },
  );
}

test.describe("Workbox runtime cache expiration", () => {
  test("stamps a Date header on cached API responses so they expire", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    let body = JSON.stringify({ stargazers_count: 1 });
    let requests = 0;

    try {
      await context.route("https://api.github.com/**", (route) => {
        requests += 1;
        return route.fulfill({
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "content-type": "application/json",
            date: new Date().toUTCString(),
          },
          body,
        });
      });

      await waitForServiceWorker(page);

      expect(await fetchApi(page)).toBe(
        JSON.stringify({ stargazers_count: 1 }),
      );
      expect(requests).toBe(1);

      // CacheFirst stores the response after handing it back.
      await expect.poll(() => readCachedResponse(page)).not.toBeNull();

      // Cross-origin responses hide `Date` from the service worker, so the cache
      // would hold an undated entry without the stamping plugin.
      const cached = await readCachedResponse(page);
      expect(cached?.body).toBe(JSON.stringify({ stargazers_count: 1 }));
      expect(cached?.date).not.toBeNull();
      expect(Date.parse(cached!.date!)).toBeGreaterThan(Date.now() - 60_000);

      // Still CacheFirst: a fresh entry is served without touching the network.
      expect(await fetchApi(page)).toBe(
        JSON.stringify({ stargazers_count: 1 }),
      );
      expect(requests).toBe(1);

      await ageCacheEntry(page);

      body = JSON.stringify({ stargazers_count: 2 });

      // The entry is two days old, so it must not be reused.
      expect(await fetchApi(page)).toBe(
        JSON.stringify({ stargazers_count: 2 }),
      );
      expect(requests).toBe(2);

      // The refreshed response is cached with a new stamp and served again.
      await expect
        .poll(async () => (await readCachedResponse(page))?.body)
        .toBe(JSON.stringify({ stargazers_count: 2 }));

      expect(await fetchApi(page)).toBe(
        JSON.stringify({ stargazers_count: 2 }),
      );
      expect(requests).toBe(2);
    } finally {
      await closeExtension(session);
    }
  });

  test("re-fetches entries cached before the stamping plugin existed", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    let requests = 0;

    try {
      await context.route("https://api.github.com/**", (route) => {
        requests += 1;
        return route.fulfill({
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "content-type": "application/json",
          },
          body: JSON.stringify({ stargazers_count: 7 }),
        });
      });

      await waitForServiceWorker(page);

      // Seed the cache the way a service worker without the stamping plugin
      // would have: a stored response that carries no `Date` header.
      await page.evaluate(
        async ({ url, body }) => {
          const cache = await caches.open("tabliss-cache-apis");
          await cache.put(
            url,
            new Response(body, {
              headers: { "content-type": "application/json" },
            }),
          );
        },
        { url: API_URL, body: JSON.stringify({ stargazers_count: 0 }) },
      );

      // Serving that entry would leave existing installs on stale data even
      // after they update.
      expect(await fetchApi(page)).toBe(
        JSON.stringify({ stargazers_count: 7 }),
      );
      expect(requests).toBe(1);

      await expect
        .poll(async () => (await readCachedResponse(page))?.date)
        .not.toBeNull();
    } finally {
      await closeExtension(session);
    }
  });

  test("does not cache failed API responses", async () => {
    const session = await launchExtension();
    const { context, page } = session;

    let requests = 0;

    try {
      await context.route("https://api.github.com/**", (route) => {
        requests += 1;
        return route.fulfill({
          status: 500,
          headers: {
            "access-control-allow-origin": "*",
            "content-type": "application/json",
          },
          body: JSON.stringify({ message: "boom" }),
        });
      });

      await waitForServiceWorker(page);

      expect(await fetchApi(page)).toBe(JSON.stringify({ message: "boom" }));
      expect(requests).toBe(1);

      // The strategy caches in `event.waitUntil`, so give that write a chance to
      // settle before checking that it did not happen.
      await page.waitForTimeout(500);

      // A failed response must not reach the cache, or CacheFirst would serve
      // the error for a day instead of retrying.
      expect(await readCachedResponse(page)).toBeNull();

      expect(await fetchApi(page)).toBe(JSON.stringify({ message: "boom" }));
      expect(requests).toBe(2);
    } finally {
      await closeExtension(session);
    }
  });
});
