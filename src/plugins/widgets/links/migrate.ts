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
    link.iconSize,
  );

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
  let changed = false;
  let cacheChanged = false;
  let newCache = { ...cache };

  const seenIds = new Set<string>();

  const linksWithIds = data.links.map((link, index) => {
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
      linkModified = true;
    }

    if (linkModified) {
      changed = true;
      return updatedLink;
    }
    return link;
  });

  return {
    data: { ...data, links: linksWithIds },
    cache: newCache,
    dataChanged: changed,
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
