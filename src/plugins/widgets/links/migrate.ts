import { Cache, Data, Link as LinkType } from "./types";

type LegacyLink = LinkType & {
  IconString?: string;
  SvgString?: string;
  IconStringIco?: string;
  iconifyIdentifier?: string;
  icon?: string;
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

    // Migrate legacy _favicon to _favicon_google
    if (updatedLink.icon === "_favicon") {
      updatedLink.icon = "_favicon_google";
      linkModified = true;
    }

    // Migrate legacy Feather icon strings (stored in 'icon' property) to iconifyValue
    if (
      updatedLink.icon &&
      !updatedLink.icon.includes(":") &&
      !updatedLink.icon.startsWith("_") &&
      !updatedLink.iconifyValue
    ) {
      updatedLink.iconifyValue = `feather:${updatedLink.icon}`;
      updatedLink.icon = "_feather";
      linkModified = true;
    }

    // Migrate IconString (Custom Iconify) to iconifyValue
    if (
      updatedLink.icon === "_custom_iconify" &&
      updatedLink.IconString &&
      !updatedLink.iconifyValue
    ) {
      updatedLink.iconifyValue = updatedLink.IconString;
      delete updatedLink.IconString;
      linkModified = true;
    }

    // Consolidate iconifyIdentifier and iconifyValue (legacy migration only)
    if (
      updatedLink.iconifyValue &&
      !updatedLink.iconifyValue.includes(":") &&
      (updatedLink.icon !== "_custom_iconify" || updatedLink.iconifyIdentifier)
    ) {
      updatedLink.iconifyValue =
        (updatedLink.iconifyIdentifier || "feather:") +
        updatedLink.iconifyValue;
      delete updatedLink.iconifyIdentifier;
      linkModified = true;
    }

    // Migrate SvgString from Data to Cache
    if (
      updatedLink.icon === "_custom_svg" &&
      updatedLink.SvgString &&
      !updatedLink.iconCacheKey
    ) {
      const cacheKey = `links_svg_${updatedLink.id}`;
      newCache[cacheKey] = {
        data: updatedLink.SvgString,
        type: "svg",
      };

      updatedLink.iconCacheKey = cacheKey;
      delete updatedLink.SvgString;
      linkModified = true;
      cacheChanged = true;
    }

    // Migrate IconStringIco from Data to Cache
    if (
      updatedLink.icon === "_custom_ico" &&
      updatedLink.IconStringIco &&
      !updatedLink.iconCacheKey
    ) {
      const cacheKey = `links_ico_${updatedLink.id}`;
      newCache[cacheKey] = {
        data: updatedLink.IconStringIco,
        type: "ico",
      };

      updatedLink.iconCacheKey = cacheKey;
      delete updatedLink.IconStringIco;
      linkModified = true;
      cacheChanged = true;
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
