import { addIcon, loadIcon } from "@iconify/react";
import tlds from "tlds";

export const SECONDS = 1000;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;

export const capitalize = (string: string) => {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Parse an ISO date string (YYYY-MM-DD) in local timezone
 * Avoids the UTC conversion that happens with new Date("YYYY-MM-DD")
 * @param dateString ISO date string in format YYYY-MM-DD
 * @returns Date object in local timezone
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatBytes = (
  bytes: number,
  options?: { decimals?: number; binary?: boolean },
) => {
  if (bytes === 0) return "0 Bytes";

  const defaultOptions = { decimals: 2, binary: false };
  const { decimals, binary } = { ...defaultOptions, ...options };
  const k = binary ? 1024 : 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Code for unbiased rand from https://pthree.org/2018/06/13/why-the-multiply-and-floor-rng-method-is-biased
export const unbiasedRand = (range: number) => {
  const max = Math.floor(2 ** 32 / range) * range;
  let x;
  do {
    x = Math.floor(Math.random() * 2 ** 32);
  } while (x >= max);

  return x % range;
};

// List of all icons used in the application
// Add icons here as they are used in the application
const baseIcons = [
  "feather:arrow-left",
  "feather:arrow-right",
  "feather:play",
  "feather:pause",
  "feather:check",
  "feather:edit",
  "feather:search",
  "feather:navigation",
  "feather:settings",
  "feather:alert-triangle",
  "feather:zap",
  "feather:globe",
  "feather:twitter",
  "feather:github",
  "feather:eye-off",
  "feather:eye",
  "feather:maximize-2",
  "feather:minimize-2",
];

/**
 * Pre-caches all common icons used in the application.
 * This ensures icons are available offline once loaded.
 */
export async function preloadBaseIcons() {
  try {
    await Promise.all(
      baseIcons.map(async (iconName) => {
        try {
          const iconData = await loadIcon(iconName);
          if (iconData) {
            addIcon(iconName, iconData);
          }
        } catch (error) {
          console.warn(`Failed to load icon: ${iconName}`, error);
        }
      }),
    );
    console.log("Icons pre-cached successfully");
  } catch (error) {
    console.error("Failed to pre-cache icons:", error);
  }
}

export async function addIconData(iconName: string) {
  try {
    const iconData = await loadIcon(iconName);
    if (iconData) {
      addIcon(iconName, iconData);
    }
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
  }
}

/**
 * Parse a font-family string that may include OpenType features using the
 * syntax `Family:feat1&feat2` (e.g. `Cambria:onum&smcp`). If the family
 * name contains quoted text ("..."), any colon inside quotes is ignored.
 * Returns the family (trimmed) and a ready-to-spread `style` object when
 * OpenType features are present (e.g. `{ fontFeatureSettings: "'onum' 1" }`).
 */
export function parseFontFamilyAndFeatures(value: string | undefined) {
  if (!value) return { family: "", style: undefined };

  const str = value.trim();
  let family = str;
  let features: string | undefined;

  // quoted font name (supports single or double quotes)
  if (str.startsWith('"') || str.startsWith("'")) {
    const quote = str[0];
    const end = str.indexOf(quote, 1);
    if (end !== -1) {
      family = str.slice(1, end);
      if (str[end + 1] === ":")
        features = (str.slice(end + 2) || undefined)?.trim();
    }
  } else {
    const idx = str.lastIndexOf(":");
    if (idx !== -1) {
      family = str.slice(0, idx).trim();
      features = (str.slice(idx + 1) || undefined)?.trim();
    }
  }

  const rawFeatures = features || undefined;

  // Inline formatting: convert shorthand like "onum&smcp" into
  // a CSS `font-feature-settings` string: `'onum' 1, 'smcp' 1`.
  let formatted: string | undefined;
  if (rawFeatures) {
    const s = rawFeatures.trim();
    if (s) {
      formatted = s
        .split(/&|\s+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `'${p}' 1`)
        .join(", ");
    }
  }

  return {
    family,
    style: formatted ? { fontFeatureSettings: formatted } : undefined,
  };
}

export function selectUnit(from: number, to: number) {
  const secs = (from - to) / 1000;
  if (Math.abs(secs) < 45) {
    return {
      value: Math.round(secs),
      unit: "second" as const,
    };
  }

  const mins = secs / 60;
  if (Math.abs(mins) < 45) {
    return {
      value: Math.round(mins),
      unit: "minute" as const,
    };
  }

  const hours = mins / 60;
  if (Math.abs(hours) < 22) {
    return {
      value: Math.round(hours),
      unit: "hour" as const,
    };
  }

  const days = hours / 24;
  if (Math.abs(days) < 365) {
    return {
      value: Math.round(days),
      unit: "day" as const,
    };
  }

  const years = days / 360;
  return {
    value: Math.round(years),
    unit: "year" as const,
  };
}

/**
 * Safely wraps a cursor value within the bounds of a given length.
 * This uses a true modulo operation that correctly handles negative numbers.
 *
 * @param cursor The current cursor index
 * @param length The total number of items
 * @returns A safe, wrapped index within [0, length - 1]
 */
export function wrap(cursor: number, length: number): number {
  if (length <= 0) return 0;
  return ((cursor % length) + length) % length;
}

/**
 * Normalizes a URL by adding https:// if it's a valid TLD and no scheme is present.
 * @param url The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // If the string already contains any scheme (e.g. "http:", "https:",
  // "mailto:", "file:", "ftp:", etc.), return as-is.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlObj = new URL(`https://${trimmed}`);
    const hostname = urlObj.hostname.toLowerCase();
    const parts = hostname.split(".");
    const actualTld = parts[parts.length - 1];
    if (parts.length > 1 && actualTld && tlds.includes(actualTld)) {
      return `https://${trimmed}`;
    }
  } catch {
    // return the original URL as is (trimmed)
  }

  return trimmed;
}

export function isSpecialUrl(url: string): boolean {
  const s = (url || "").toLowerCase();
  // This is not exhaustive, but covers the main cases, the checkbox can be used if its not automatically detected.
  const prefixes = [
    "about:",
    "chrome:",
    "edge:",
    "vivaldi:",
    "opera:",
    "file:",
    "chrome-extension:",
    "moz-extension:",
    "ms-settings:",
    "view-source:",
  ];
  return prefixes.some((p) => s.startsWith(p));
}
