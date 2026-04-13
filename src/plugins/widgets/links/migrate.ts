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
): { iconConfig?: IconConfig; cache: Cache; cacheChanged: boolean } => {
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

  if (legacyIcon === "_custom_svg" && link.SvgString && !link.iconCacheKey) {
    const cacheKey = `links_svg_${link.id}`;
    nextCache = {
      ...nextCache,
      [cacheKey]: {
        data: link.SvgString,
        type: "svg",
      },
    };
    cacheChanged = true;
    link.iconCacheKey = cacheKey;
  }

  if (legacyIcon === "_custom_ico" && link.IconStringIco && !link.imageUrl) {
    link.imageUrl = link.IconStringIco;
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
        iconConfig: link.iconCacheKey
          ? {
              type: "custom_svg",
              cacheKey: link.iconCacheKey,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
      };
    case "_custom_ico":
      return {
        iconConfig: link.imageUrl
          ? {
              type: "custom_image_url",
              url: link.imageUrl,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
      };
    case "_custom_upload":
      return {
        iconConfig: link.iconCacheKey
          ? {
              type: "custom_upload",
              cacheKey: link.iconCacheKey,
            }
          : undefined,
        cache: nextCache,
        cacheChanged,
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
  changed: boolean;
  cacheChanged: boolean;
} {
  let changed = false;
  let cacheChanged = false;
  const newCache = { ...cache };

  const linksWithIds = data.links.map((link, index) => {
    const updatedLink = { ...link } as LegacyLink;
    let linkModified = false;

    // Ensure all links have unique IDs
    if (
      !updatedLink.id ||
      data.links.filter((l) => l.id === updatedLink.id).length > 1
    ) {
      updatedLink.id =
        Date.now().toString(36) + Math.random().toString(36).slice(2) + index;
      linkModified = true;
    }

    if (hasLegacyIconFields(updatedLink)) {
      const migratedIcon = getMigratedIconConfig(updatedLink, newCache);
      if (migratedIcon.cacheChanged) {
        cacheChanged = true;
        Object.assign(newCache, migratedIcon.cache);
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
    changed,
    cacheChanged,
  };
}
