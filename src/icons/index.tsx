import {
  Icon as OnlineIcon,
  type IconifyIcon as IconData,
  type IconProps as IconifyIconProps,
  loadIcon,
} from "@iconify/react";
import { Icon as OfflineIcon } from "@iconify/react/offline";
import {
  createElement,
  type FC,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

import { cache } from "../db/cache";
import { DB } from "../lib";
import bundled from "./bundled.json";

type Collection = {
  prefix: string;
  icons: Record<string, IconData>;
  width?: number;
  height?: number;
};

const collections = bundled as Record<string, Collection>;
const pending = new Map<string, Promise<IconData>>();

export const iconCatalog = {
  feather: Object.keys(bundled.feather.icons).sort(),
};

type Props = Omit<IconifyIconProps, "icon"> & { name: string };

const getBundledIcon = (name: string): IconData | undefined => {
  const separator = name.indexOf(":");
  if (separator === -1) return undefined;
  const collection = collections[name.slice(0, separator)];
  const icon = collection?.icons[name.slice(separator + 1)];
  if (!icon) return undefined;
  return {
    ...icon,
    width: icon.width ?? collection.width,
    height: icon.height ?? collection.height,
  };
};

const cacheKey = (name: string) => `iconify/${name}`;

const getCachedIcon = (name: string): IconData | undefined =>
  DB.get(cache, cacheKey(name)) as IconData | undefined;

const loadAndCacheIcon = (name: string): Promise<IconData> => {
  const existing = pending.get(name);
  if (existing) return existing;

  const request = loadIcon(name).then((icon) => {
    DB.put(cache, cacheKey(name), icon);
    return icon;
  });
  pending.set(name, request);
  request.finally(() => pending.delete(name)).catch(() => undefined);
  return request;
};

export const Icon: FC<Props> = ({ name, ...props }) => {
  const bundledIcon = getBundledIcon(name);
  const key = cacheKey(name);
  const subscribe = useCallback(
    (listener: () => void) =>
      DB.listen(cache, ([changedKey]) => {
        if (changedKey === key) listener();
      }),
    [key],
  );
  const readCache = useCallback(() => getCachedIcon(name), [name]);
  const cachedIcon = useSyncExternalStore(subscribe, readCache, readCache);

  useEffect(() => {
    if (bundledIcon || cachedIcon || !name.includes(":")) return;
    loadAndCacheIcon(name).catch(() => undefined);
  }, [bundledIcon, cachedIcon, name]);

  const icon = bundledIcon ?? cachedIcon;
  if (!icon) return null;

  return createElement(OfflineIcon, {
    icon,
    ...props,
  });
};

/** Render discovery results without adding every preview to persistent storage. */
export const IconPreview: FC<Props> = ({ name, ...props }) => {
  const bundledIcon = getBundledIcon(name);
  return createElement(bundledIcon ? OfflineIcon : OnlineIcon, {
    icon: bundledIcon ?? name,
    ...props,
  });
};
