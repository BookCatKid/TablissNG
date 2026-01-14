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
