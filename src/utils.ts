import { addIcon, loadIcon } from "@iconify/react";

export const SECONDS = 1000;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;

export const capitalize = (string: string) => {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
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
