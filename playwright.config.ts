import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL: "http://localhost:8080",
    // Pin the locale so UI text (and title-based selectors) is deterministic.
    locale: "en-US",
    trace: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "pnpm run build:prepare && pnpm dev:web",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
