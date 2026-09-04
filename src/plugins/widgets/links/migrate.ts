import { Cache, Data, IconConfig, Link as LinkType } from "./types";

type LegacyLink = LinkType & {
  IconString?: string;
  SvgString?: string;
  IconStringIco?: string;
  iconifyIdentifier?: string;
  icon?: string;
  iconifyValue?: string;
  imageUrl?: string;
  iconCacheKey?: string;
  iconSize?: number;
  customIconSize?: number;
};

type LegacyData = Omit<
  Data,
  "links" | "linksNumbered" | "sortBy" | "centerLinks"
> & {
  links: LegacyLink[];
  linksNumbered?: boolean;
  sortBy?: Data["sortBy"];
  centerLinks?: boolean;
  customWidth?: number;
  customHeight?: number;
  customIconSize?: number;
  iconifyIdentifier?: string;
  iconifyValue?: string;
  conserveAspectRatio?: boolean;
};

const hasLegacyIconFields = (link: LegacyLink): boolean =>
  Boolean(
    link.icon ||
    link.IconString ||
    link.SvgString ||
    link.IconStringIco ||
    link.iconifyIdentifier ||
    link.iconifyValue ||
    link.imageUrl ||
    link.iconCacheKey ||
    link.iconSize ||
    link.customIconSize,
  );

const migrateLegacyDimensions = (link: LegacyLink, data: LegacyData): void => {
  const legacyIcon = link.icon;
  const iconUsedIconSize =
    legacyIcon === "_favicon" ||
    legacyIcon?.startsWith("_favicon_") ||
    (typeof legacyIcon === "string" && !legacyIcon.startsWith("_"));

  if (iconUsedIconSize && link.iconSize !== undefined) {
    link.customWidth = link.iconSize;
    link.customHeight = link.iconSize;
    return;
  }

  const legacySquareSize = link.customIconSize;
  const fallbackWidth =
    legacySquareSize ?? data.customWidth ?? data.customIconSize;
  const fallbackHeight =
    legacySquareSize ??
    data.customHeight ??
    data.customWidth ??
    data.customIconSize;
  if (link.customWidth === undefined && fallbackWidth !== undefined) {
    link.customWidth = fallbackWidth;
  }
  if (link.customHeight === undefined && fallbackHeight !== undefined) {
    link.customHeight = fallbackHeight;
  }

  // The old custom Iconify renderer always used width for both dimensions.
  if (
    legacyIcon === "_custom_iconify" &&
    link.customWidth !== undefined &&
    link.customHeight !== link.customWidth
  ) {
    link.customHeight = link.customWidth;
  }
};

const getMigratedIconConfig = (
  link: LegacyLink,
  cache: Cache,
): {
  iconConfig?: IconConfig;
  cache: Cache;
  cacheChanged: boolean;
  iconCacheKey?: string;
  imageUrl?: string;
} => {
  let nextCache = cache;
  let cacheChanged = false;

  if (!link.icon) {
    return {
      iconConfig: link.iconConfig,
      cache: nextCache,
      cacheChanged,
    };
  }

  let legacyIcon = link.icon;
  let iconifyValue = link.iconifyValue;
  let iconCacheKey = link.iconCacheKey;
  let imageUrl = link.imageUrl;

  if (legacyIcon === "_favicon") {
    legacyIcon = "_favicon_google";
  }

  if (
    legacyIcon.includes(":") &&
    !legacyIcon.startsWith("_") &&
    !iconifyValue
  ) {
    iconifyValue = legacyIcon;
    legacyIcon = "_custom_iconify";
  }

  if (
    legacyIcon &&
    !legacyIcon.includes(":") &&
    !legacyIcon.startsWith("_") &&
    !iconifyValue
  ) {
    iconifyValue = `feather:${legacyIcon}`;
    legacyIcon = "_feather";
  }

  if (legacyIcon === "_custom_iconify" && link.IconString && !iconifyValue) {
    iconifyValue = link.IconString;
  }

  if (
    iconifyValue &&
    !iconifyValue.includes(":") &&
    (legacyIcon !== "_custom_iconify" || link.iconifyIdentifier)
  ) {
    iconifyValue = `${link.iconifyIdentifier || "feather:"}${iconifyValue}`;
  }

  if (legacyIcon === "_custom_svg" && link.SvgString && !iconCacheKey) {
    const cacheKey = `links_svg_${link.id}`;
    nextCache = {
      ...nextCache,
      [cacheKey]: {
        data: link.SvgString,
        type: "svg",
      },
    };
    cacheChanged = true;
    iconCacheKey = cacheKey;
  }

  if (legacyIcon === "_custom_ico" && link.IconStringIco && !imageUrl) {
    imageUrl = link.IconStringIco;
  }

  switch (legacyIcon) {
    case "_favicon_google":
      return {
        iconConfig: {
          type: "favicon",
          provider: "google",
          resolution: link.iconSize,
        },
        cache: nextCache,
        cacheChanged,
      };
    case "_favicon_duckduckgo":
      return {
        iconConfig: {
          type: "favicon",
          provider: "duckduckgo",
          resolution: link.iconSize,
        },
        cache: nextCache,
        cacheChanged,
      };
    case "_favicon_favicone":
      return {
        iconConfig: {
          type: "favicon",
          provider: "favicone",
          resolution: link.iconSize,
        },
        cache: nextCache,
        cacheChanged,
      };
    case "_custom_iconify":
      return {
        iconConfig: iconifyValue
          ? {
              type: "iconify",
              value: iconifyValue,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
      };
    case "_custom_svg":
      return {
        iconConfig: iconCacheKey
          ? {
              type: "custom_svg",
              cacheKey: iconCacheKey,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
        iconCacheKey,
      };
    case "_custom_ico":
      return {
        iconConfig: imageUrl
          ? {
              type: "custom_image_url",
              url: imageUrl,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
        imageUrl,
      };
    case "_custom_upload":
      return {
        iconConfig: iconCacheKey
          ? {
              type: "custom_upload",
              cacheKey: iconCacheKey,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
        iconCacheKey,
      };
    case "_feather":
      return {
        iconConfig: {
          type: "feather",
          value: iconifyValue || "feather:bookmark",
        },
        cache: nextCache,
        cacheChanged,
      };
    default:
      return {
        iconConfig: undefined,
        cache: nextCache,
        cacheChanged,
      };
  }
};

export function migrateLinks(
  data: Data,
  cache: Cache,
): {
  data: Data;
  cache: Cache;
  dataChanged: boolean;
  cacheChanged: boolean;
} {
  let dataChanged = false;
  let cacheChanged = false;
  let newCache = { ...cache };
  const legacyData = data as unknown as LegacyData;

  const seenIds = new Set<string>();

  const linksWithIds = legacyData.links.map((link, index) => {
    const updatedLink = { ...link } as LegacyLink;
    let linkModified = false;

    // Ensure all links have unique IDs
    if (!updatedLink.id || seenIds.has(updatedLink.id)) {
      updatedLink.id =
        Date.now().toString(36) + Math.random().toString(36).slice(2) + index;
      linkModified = true;
    }
    seenIds.add(updatedLink.id);

    if (hasLegacyIconFields(updatedLink)) {
      const migratedIcon = getMigratedIconConfig(updatedLink, newCache);
      if (migratedIcon.cacheChanged) {
        cacheChanged = true;
        newCache = migratedIcon.cache;
      }

      if (migratedIcon.iconConfig) {
        migrateLegacyDimensions(updatedLink, legacyData);
        updatedLink.iconConfig = migratedIcon.iconConfig;
        delete updatedLink.icon;
        delete updatedLink.iconifyValue;
        delete updatedLink.imageUrl;
        delete updatedLink.iconCacheKey;
        delete updatedLink.iconSize;
        delete updatedLink.IconString;
        delete updatedLink.SvgString;
        delete updatedLink.IconStringIco;
        delete updatedLink.iconifyIdentifier;
        delete updatedLink.customIconSize;
        linkModified = true;
      }
    }

    if (linkModified) {
      dataChanged = true;
      return updatedLink;
    }
    return link;
  });

  const migratedData = {
    ...legacyData,
    links: linksWithIds,
    linksNumbered: legacyData.linksNumbered ?? false,
    sortBy: legacyData.sortBy ?? "none",
    centerLinks: legacyData.centerLinks ?? false,
  } as LegacyData;

  const legacyDataKeys = [
    "customWidth",
    "customHeight",
    "customIconSize",
    "iconifyIdentifier",
    "iconifyValue",
    "conserveAspectRatio",
  ] as const;
  for (const key of legacyDataKeys) {
    if (key in migratedData) {
      delete migratedData[key];
      dataChanged = true;
    }
  }

  if (
    legacyData.linksNumbered === undefined ||
    legacyData.sortBy === undefined ||
    legacyData.centerLinks === undefined
  ) {
    dataChanged = true;
  }

  return {
    data: migratedData as Data,
    cache: newCache,
    dataChanged: dataChanged,
    cacheChanged,
  };
}

/** Remove cache entries that are no longer referenced by any link. */
export function cleanupCache(
  data: Data,
  cache: Cache,
): {
  cache: Cache;
  changed: boolean;
} {
  const referencedKeys = new Set<string>();

  for (const link of data.links) {
    if (!link.iconConfig) continue;
    if (
      link.iconConfig.type === "custom_svg" ||
      link.iconConfig.type === "custom_upload"
    ) {
      referencedKeys.add(link.iconConfig.cacheKey);
    }
  }

  const cleanedCache = { ...cache };
  let changed = false;
  for (const key of Object.keys(cleanedCache)) {
    if (!referencedKeys.has(key)) {
      delete cleanedCache[key];
      changed = true;
    }
  }

  return { cache: cleanedCache, changed };
}
