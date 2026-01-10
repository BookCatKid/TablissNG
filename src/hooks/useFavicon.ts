import { useEffect, useMemo } from "react";
import { db } from "../db/state";
import { useValue } from "../lib/db/react";

const DEFAULT_ICON = "icons/128.png";
const STORAGE_KEY = "tabliss/favicon";
const FAVICON_ID = "tabliss-favicon";

const FAVICON_PATHS: Record<string, string> = {
  size32: "icons/32.png",
  size48: "icons/48.png",
  size96: "icons/96.png",
  size128: "icons/128.png",
};

/**
 * Hook to manage the page favicon based on system settings.
 *
 * It synchronizes the <link> element in the document head and
 * persists the current icon to localStorage for early loading
 * before React hydration (handled in index.html).
 */
export function useFavicon() {
  const favicon = useValue(db, "favicon");

  // Determine the final href
  const href = useMemo(() => {
    switch (favicon.mode) {
      case "custom":
        return favicon.data || DEFAULT_ICON;
      case "url":
        return favicon.url || DEFAULT_ICON;
      case "default":
        return DEFAULT_ICON;
      default:
        return FAVICON_PATHS[favicon.mode] || DEFAULT_ICON;
    }
  }, [favicon.mode, favicon.data, favicon.url]);

  useEffect(() => {
    let link = document.getElementById(FAVICON_ID) as HTMLLinkElement | null;

    // Create if missing
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.id = FAVICON_ID;
      document.head.appendChild(link);
    }

    // Sync href if changed (use getAttribute to compare raw strings)
    if (link.getAttribute("href") !== href) {
      link.href = href;
    }

    // Sync to storage so that it can be applied instantly on next load
    localStorage.setItem(STORAGE_KEY, href);
  }, [href]);
}
