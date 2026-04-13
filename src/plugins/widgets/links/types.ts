import { API } from "../../types";

export type FaviconConfig = {
  type: "favicon";
  provider: "google" | "duckduckgo" | "favicone";
  resolution?: number;
};

export type IconifyConfig = {
  type: "iconify";
  value: string;
};

export type FeatherConfig = {
  type: "feather";
  value: string;
};

export type CustomSvgConfig = {
  type: "custom_svg";
  cacheKey: string;
};

export type CustomImageUrlConfig = {
  type: "custom_image_url";
  url: string;
};

export type CustomUploadConfig = {
  type: "custom_upload";
  cacheKey: string;
};

export type IconConfig =
  | FaviconConfig
  | IconifyConfig
  | FeatherConfig
  | CustomSvgConfig
  | CustomImageUrlConfig
  | CustomUploadConfig;

export type Link = {
  // Core link data.
  id: string;
  url: string;
  name?: string;

  // Icon configuration.
  iconConfig?: IconConfig;

  // Icon display and sizing.
  conserveAspectRatio?: boolean;
  customWidth?: number;
  customHeight?: number;

  // Other Settings
  keyboardShortcut?: string;
  useExtensionTabs?: boolean;

  // Metadata
  lastUsed?: number;
};

export type IconCacheItem = {
  data: string;
  type: "image" | "svg" | "ico";
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
      iconConfig: {
        type: "feather",
        value: "feather:github",
      },
    },
  ],
  visible: true,
  linkOpenStyle: false,
  linksNumbered: false,
  sortBy: "none",
  centerLinks: false,
};

export const defaultCache: Cache = {};
