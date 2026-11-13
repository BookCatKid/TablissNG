import path from "node:path";

import { expect, test } from "@playwright/test";

import { closeSettings, openSettings, selectBackground } from "./helpers";

const endpoint = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
const imageUrl = "https://assets.science.nasa.gov/apod-test.jpg";
const entry = {
  date: "2026-09-30",
  title: "Arp 78 &amp; Friends",
  permalink: "https://science.nasa.gov/image-article/arp-78/",
  url: "https://science.nasa.gov/image-article/arp-78/",
  hdurl: imageUrl,
  media_type: "image",
  copyright: '<a href="https://example.com/">Robert Eder &amp; Friends</a>',
};

test.beforeEach(async ({ page }) => {
  await page.route("https://assets.science.nasa.gov/**", (route) =>
    route.fulfill({
      path: path.join(__dirname, "fixtures", "pixel.png"),
      contentType: "image/png",
    }),
  );
  await page.route("https://api.nasa.gov/planetary/apod**", (route) =>
    route.fulfill({ status: 500, json: { code: 500 } }),
  );
});

test("loads the new APOD image and plain-text credits with the correct attribution link", async ({
  page,
}) => {
  await page.route(`${endpoint}**`, (route) =>
    route.fulfill({ json: [entry] }),
  );
  await page.goto("/");
  await selectBackground(page, "background/apod");
  await closeSettings(page);

  const image = page.locator(".Apod .image").last();
  await expect(image).toHaveCSS("background-image", `url("${imageUrl}")`);
  await expect(page.locator(".Apod .left-info a")).toHaveText(
    "Arp 78 & Friends",
  );
  await expect(page.locator(".Apod .left-info a")).toHaveAttribute(
    "href",
    entry.permalink,
  );
  await expect(page.locator(".Apod .right-info a")).toHaveText(
    "Robert Eder & Friends",
  );
});

test("loads a custom date and keeps its image when a later request fails", async ({
  page,
}) => {
  await page.route(`${endpoint}**`, (route) =>
    route.fulfill({ json: [entry] }),
  );
  await page.route(`${endpoint}/260929`, (route) =>
    route.fulfill({
      json: {
        ...entry,
        date: "2026-09-29",
        hdurl: "https://assets.science.nasa.gov/custom.jpg",
      },
    }),
  );
  await page.route(`${endpoint}/260928`, (route) =>
    route.fulfill({ status: 500, json: { code: 500 } }),
  );
  await page.route(`${endpoint}/260927`, (route) =>
    route.fulfill({ json: { code: 500, msg: "Internal Service Error" } }),
  );
  await page.goto("/");
  await selectBackground(page, "background/apod");
  await expect(page.locator(".Apod .image").last()).toHaveCSS(
    "background-image",
    `url("${imageUrl}")`,
  );
  await page.locator(".ApodSettings select").selectOption("custom");
  await page.locator('.ApodSettings input[type="date"]').fill("2026-09-29");
  await expect(page.locator(".Apod .image").last()).toHaveCSS(
    "background-image",
    /custom\.jpg/,
  );
  for (const date of ["2026-09-28", "2026-09-27"]) {
    const failedRequest = page.waitForResponse(
      `${endpoint}/${date.replaceAll("-", "").slice(2)}`,
    );
    await page.locator('.ApodSettings input[type="date"]').fill(date);
    await failedRequest;
    await closeSettings(page);
    await page.locator('.Overlay button[title="Show errors"]').click();
    await expect(page.locator(".Modal")).toContainText("NASA APOD");
    await expect(page.locator(".Apod .image").last()).toHaveCSS(
      "background-image",
      /custom\.jpg/,
    );
    await page.locator(".Modal-container").click({ position: { x: 0, y: 0 } });
    await openSettings(page);
  }
});

test("renders direct videos and embedded-video thumbnails from NASA's HTML", async ({
  page,
}) => {
  const videoUrl = "https://assets.science.nasa.gov/occultation.mp4";
  await page.route(`${endpoint}**`, (route) =>
    route.fulfill({
      json: [
        {
          ...entry,
          media_type: "video",
          basic_html: `<html><body><video controls><source src="${videoUrl}" type="video/mp4"></video></body></html>`,
        },
      ],
    }),
  );
  await page.route(`${endpoint}/260929`, (route) =>
    route.fulfill({
      json: {
        ...entry,
        date: "2026-09-29",
        media_type: "iframe",
        hdurl: "",
        basic_html:
          '<iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk"></iframe>',
      },
    }),
  );
  await page.route("https://img.youtube.com/**", (route) =>
    route.fulfill({
      path: path.join(__dirname, "fixtures", "pixel.png"),
      contentType: "image/png",
    }),
  );
  await page.goto("/");
  await selectBackground(page, "background/apod");
  await closeSettings(page);

  await expect(page.locator(".Apod video").last()).toHaveAttribute(
    "src",
    videoUrl,
  );
  await openSettings(page);
  await page.locator(".ApodSettings select").selectOption("custom");
  await page.locator('.ApodSettings input[type="date"]').fill("2026-09-29");
  await expect(page.locator(".Apod .image").last()).toHaveCSS(
    "background-image",
    /img\.youtube\.com\/vi\/abcdefghijk\/hqdefault\.jpg/,
  );
});

test("ignores an older date request that finishes after a newer selection", async ({
  page,
}) => {
  let releaseRequest: () => void = () => {};
  const heldRequest = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route(`${endpoint}**`, (route) =>
    route.fulfill({ json: [entry] }),
  );
  await page.route(`${endpoint}/260929`, async (route) => {
    await heldRequest;
    await route.fulfill({ json: { ...entry, date: "2026-09-29" } });
  });
  await page.route(`${endpoint}/260928`, (route) =>
    route.fulfill({
      json: {
        ...entry,
        date: "2026-09-28",
        hdurl: "https://assets.science.nasa.gov/newer.jpg",
      },
    }),
  );
  await page.goto("/");
  await selectBackground(page, "background/apod");
  await page.locator(".ApodSettings select").selectOption("custom");
  const requested = page.waitForRequest(`${endpoint}/260929`);
  await page.locator('.ApodSettings input[type="date"]').fill("2026-09-29");
  await requested;
  await page.locator('.ApodSettings input[type="date"]').fill("2026-09-28");
  const image = page.locator(".Apod .image").last();
  await expect(image).toHaveCSS("background-image", /newer\.jpg/);
  const finished = page.waitForResponse(`${endpoint}/260929`);
  releaseRequest();
  await (await finished).finished();
  await expect(
    page.locator('.Overlay [title="Loading new content"]'),
  ).toHaveCount(0);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await closeSettings(page);
  await expect(page.locator(".Apod .image")).toHaveCount(1);
  await expect(image).toHaveCSS("background-image", /newer\.jpg/);
});

test("refreshes legacy cached images even when their date matches today", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-30T12:00:00"));
  await page.route(`${endpoint}**`, (route) =>
    route.fulfill({
      json: [entry],
    }),
  );
  await page.goto("/");
  await selectBackground(page, "background/apod");
  await closeSettings(page);
  await expect(page.locator(".Apod .left-info a")).toHaveText(
    "Arp 78 & Friends",
  );

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<boolean>((resolve, reject) => {
            const request = indexedDB.open("tabliss/cache", 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const connection = request.result;
              const transaction = connection.transaction(
                "changes",
                "readwrite",
              );
              const cursor = transaction.objectStore("changes").openCursor();
              let updated = false;
              cursor.onsuccess = () => {
                if (!cursor.result) return;
                const value = cursor.result.value;
                if (value?.permalink) {
                  delete value.permalink;
                  Object.assign(value, {
                    url: "https://apod.nasa.gov/old.jpg",
                    hdurl: "https://apod.nasa.gov/old.jpg",
                  });
                  cursor.result.update(value);
                  updated = true;
                }
                cursor.result.continue();
              };
              transaction.oncomplete = () => {
                connection.close();
                resolve(updated);
              };
              transaction.onerror = () => {
                connection.close();
                reject(transaction.error);
              };
            };
          }),
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(page.locator(".Apod .image").last()).toHaveCSS(
    "background-image",
    `url("${imageUrl}")`,
  );
});
