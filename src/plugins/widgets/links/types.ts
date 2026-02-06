import { API } from "../../types";

export type Link = {
  id: string;
  name?: string;
  icon?: string;
  url: string;
  keyboardShortcut?: string;
  lastUsed?: number;
  iconSize?: number;
  conserveAspectRatio?: boolean;
  customWidth?: number;
  customHeight?: number;
  iconifyIdentifier?: string;
  iconifyValue?: string;
  useExtensionTabs?: boolean;
  iconCacheKey?: string; // Reference to cached icon data
};

export type IconCacheItem = {
  data: string;
  type: "image" | "svg" | "ico";
  size: number;
};

export type Cache = Record<string, IconCacheItem>;

export type Data = {
  columns: number;
  links: Link[];
  visible: boolean;
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  sortBy: "none" | "name" | "icon" | "lastUsed";
  centerLinks: boolean;
};

export type Props = API<Data, Cache>;

export type DisplayProps = Link & {
  linkOpenStyle: boolean;
  linksNumbered: boolean;
  number: number;
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
  centerLinks: false,
};

export const defaultCache: Cache = {};
