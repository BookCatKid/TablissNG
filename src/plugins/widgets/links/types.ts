import { API } from "../../types";

export type Link = {
  id: string;
  name?: string;
  icon?: string;
  url: string;
  keyboardShortcut?: string;
  lastUsed?: number;
  iconSize?: number;
  IconString?: string;
  IconStringIco?: string;
  SvgString?: string;
  customWidth?: number;
  customHeight?: number;
  iconifyIdentifier?: string;
  iconifyValue?: string;
  // Reference to cached icon data
  iconCacheKey?: string;
  conserveAspectRatio?: boolean;
  useExtensionTabs?: boolean;
};

export type IconCacheItem = {
  data: string;
  type: "image" | "svg" | "ico";
  size: number;
};

/**
 * Recently-used timestamps are intentionally kept in the local cache rather
 * than the synced link configuration. Persisting them in sync storage makes
 * every click rewrite the complete links payload and can exhaust the browser
 * storage.sync quota.
 */
export type LastUsedCacheItem = {
  data: Record<string, number>;
  type: "lastUsed";
  size: 0;
};

export type CacheItem = IconCacheItem | LastUsedCacheItem;
export type Cache = Record<string, CacheItem>;

export const LAST_USED_CACHE_KEY = "__links_last_used__";

export const getCachedIcon = (
  cache: Cache | undefined,
  key: string | undefined,
): IconCacheItem | undefined => {
  if (!cache || !key) return undefined;
  const item = cache[key];
  return item?.type === "lastUsed" ? undefined : item;
};

export const sanitizeLink = (link: Link): Link => {
  const sanitized = { ...link };

  delete sanitized.lastUsed;
  if (sanitized.icon !== "_custom_iconify") delete sanitized.IconString;
  if (sanitized.icon !== "_custom_ico") delete sanitized.IconStringIco;
  if (sanitized.icon !== "_custom_svg") delete sanitized.SvgString;
  if (sanitized.icon !== "_custom_svg" && sanitized.icon !== "_custom_upload")
    delete sanitized.iconCacheKey;
  if (sanitized.icon !== "_feather") {
    delete sanitized.iconifyIdentifier;
    delete sanitized.iconifyValue;
  }

  return sanitized;
};

/** Normalize persisted links without changing their order. */
export const normalizeLinks = (links: Link[]): Link[] => {
  const idCounts = new Map<string, number>();
  links.forEach((link) => {
    if (link.id) idCounts.set(link.id, (idCounts.get(link.id) ?? 0) + 1);
  });

  return links.map((link, index) => {
    const hasUniqueId = Boolean(link.id) && idCounts.get(link.id) === 1;
    const withId = hasUniqueId
      ? link
      : {
          ...link,
          id:
            Date.now().toString(36) +
            Math.random().toString(36).slice(2) +
            index,
        };
    const normalized = sanitizeLink(withId);

    if (normalized.icon === "_custom_svg") {
      normalized.iconCacheKey =
        normalized.iconCacheKey || getSvgCacheKey(normalized.id);
      delete normalized.SvgString;
    }

    return normalized;
  });
};

/** Compare link records without serializing the full array. */
export const areLinksEqual = (left: Link[], right: Link[]): boolean => {
  if (left.length !== right.length) return false;

  return left.every((link, index) => {
    const other = right[index];
    const keys = new Set([...Object.keys(link), ...Object.keys(other)]);

    return [...keys].every((key) =>
      Object.is(link[key as keyof Link], other[key as keyof Link]),
    );
  });
};

/** Compare the optional last-used cache entry without serializing it. */
export const areLastUsedCacheEqual = (
  current: CacheItem | undefined,
  next: LastUsedCacheItem | undefined,
): boolean => {
  if (current?.type !== "lastUsed" || !next) return current === next;

  const ids = new Set([
    ...Object.keys(current.data),
    ...Object.keys(next.data),
  ]);
  return [...ids].every((id) => current.data[id] === next.data[id]);
};

export const getSvgCacheKey = (linkId: string): string => `svg_${linkId}`;

export const getLastUsed = (link: Link, cache?: Cache): number => {
  const cached = cache?.[LAST_USED_CACHE_KEY];
  if (cached?.type === "lastUsed") {
    return cached.data[link.id] ?? link.lastUsed ?? 0;
  }
  return link.lastUsed ?? 0;
};

export const setLastUsed = (
  cache: Cache,
  id: string,
  timestamp: number,
): Cache => {
  const current = cache[LAST_USED_CACHE_KEY];
  const lastUsed = current?.type === "lastUsed" ? current.data : {};

  return {
    ...cache,
    [LAST_USED_CACHE_KEY]: {
      type: "lastUsed",
      data: { ...lastUsed, [id]: timestamp },
      size: 0,
    },
  };
};

export type Data = {
  columns: number;
  links: Link[];
  visible: boolean;
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  customWidth: number;
  customHeight?: number;
  sortBy: "none" | "name" | "icon" | "lastUsed";
  iconifyIdentifier: string;
  iconifyValue?: string;
  conserveAspectRatio?: boolean;
};

export type Props = API<Data, Cache>;

export type DisplayProps = Link & {
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  number: number;
  customWidth?: number;
  customHeight?: number;
  cache: Cache;
  onLinkClick?: () => void;
};

export const defaultData: Data = {
  columns: 1,
  links: [
    {
      id: "default-link",
      url: "https://github.com/BookCatKid/TablissNG",
      name: "TablissNG",
    },
  ],
  visible: true,
  linkOpenStyle: false,
  linksNumbered: false,
  sortBy: "none",
  customWidth: 24,
  customHeight: 24,
  iconifyIdentifier: "feather:",
  conserveAspectRatio: false,
};

export const defaultCache: Cache = {};
