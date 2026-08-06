import { expect, type Page, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

const IP_API = "https://www.gogeoip.com/json/*";

/** Build a mock gogeoip.com response for the given IP. */
function mockResponse(ip: string) {
  return JSON.stringify({
    network: { ip },
    location: { city: "Testville", country: { name: "Testland" } },
  });
}

/** Mock the IP lookup API, counting how many times it is called. */
async function mockIpApi(page: Page, ip = "203.0.113.7") {
  let count = 0;
  await page.route(IP_API, (route) => {
    count += 1;
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: mockResponse(ip),
    });
  });
  return { requests: () => count };
}

/** Set the auto-refresh toggle for the IP Info widget. */
async function setAutoRefresh(page: Page, enabled: boolean): Promise<void> {
  await openSettings(page);
  await expandWidgetSettings(page, "IP Info");
  const checkbox = widgetSettingsFieldset(page, "IP Info").locator(
    'label:has-text("Auto Refresh") input[type="checkbox"]',
  );
  if (enabled) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
  await closeSettings(page);
}

test.describe("IP Info widget", () => {
  test("renders the IP and location from the API", async ({ page }) => {
    await mockIpApi(page);
    await page.goto("/");

    await addWidget(page, "widget/ipInfo");
    await closeSettings(page);

    const widget = page.locator(".IpInfo");
    await expect(widget).toBeVisible();
    await expect(widget).toHaveText("203.0.113.7, Testville, Testland");
  });

  test("refreshes the IP info when clicked", async ({ page }) => {
    let ip = "203.0.113.7";
    await page.route(IP_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockResponse(ip),
      }),
    );
    await page.goto("/");

    await addWidget(page, "widget/ipInfo");
    await closeSettings(page);

    const widget = page.locator(".IpInfo");
    await expect(widget).toContainText("203.0.113.7");

    ip = "198.51.100.9";
    await widget.click();
    await expect(widget).toContainText("198.51.100.9");
  });

  test("auto-refresh fetches immediately on enable, every 30s, and stops when disabled", async ({
    page,
  }) => {
    await page.clock.install();
    const api = await mockIpApi(page);
    await page.goto("/");

    await addWidget(page, "widget/ipInfo");
    // Wait for the mount fetches (StrictMode fires two in dev) to land.
    await expect.poll(() => api.requests()).toBeGreaterThan(0);
    const mountCount = api.requests();

    // Enabling auto-refresh fetches immediately…
    await setAutoRefresh(page, true);
    await expect.poll(() => api.requests()).toBeGreaterThan(mountCount);
    const baseline = api.requests();

    // …then exactly once per 30s tick (steady cadence, not a loop).
    await page.clock.fastForward(30_001);
    await expect.poll(() => api.requests()).toBe(baseline + 1);

    await page.clock.fastForward(30_001);
    await expect.poll(() => api.requests()).toBe(baseline + 2);

    // Disabling auto-refresh stops the interval (one last fetch fires on toggle).
    const beforeDisable = api.requests();
    await setAutoRefresh(page, false);
    await expect.poll(() => api.requests()).toBe(beforeDisable + 1);

    const afterDisable = api.requests();
    await page.clock.fastForward(30_001);
    await expect.poll(() => api.requests()).toBe(afterDisable);
  });
});
