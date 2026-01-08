import type { Browser } from "webextension-polyfill";

declare global {
  const BUILD_TARGET: "chromium" | "firefox" | "web" | "safari";
  const DEV: boolean;
  const GIPHY_API_KEY: string;
  const UNSPLASH_API_KEY: string;
  const NASA_API_KEY: string;
  const TRELLO_API_KEY: string;
  const VERSION: string;
  const browser: Browser;
}
