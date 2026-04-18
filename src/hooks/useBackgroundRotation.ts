import { useCallback, useEffect } from "react";

import { Cache, Loader } from "../plugins/types";
import { wrap } from "../utils";
import { RotatingCache, useRotatingCache } from "./useCache";

type RotationData = {
  paused?: boolean;
  timeout?: number;
  sortOrder?: "sequence" | "random";
};

type Options<T, D extends RotationData> = {
  fetch: () => Promise<T[]>;
  cacheObj: Cache<RotatingCache<T>>;
  data?: D;
  setData?: (data: D) => void;
  loader?: Loader;
  deps?: unknown[];
  buildUrl?: (item: T) => string | null;
};

export function useBackgroundRotation<
  T,
  D extends RotationData = RotationData,
>({
  fetch,
  cacheObj,
  data,
  setData,
  loader,
  deps = [],
  buildUrl,
}: Options<T, D>) {
  const timeout = data
    ? data.paused
      ? Number.MAX_SAFE_INTEGER
      : (data.timeout ?? 0) * 1000
    : 0;

  const item = useRotatingCache<T>(fetch, cacheObj, timeout, deps);

  // Preload next item when available
  useEffect(() => {
    const cache = cacheObj.cache;
    if (!cache || !buildUrl || !loader) return;
    const next = cache.items[cache.cursor + 1];
    if (next) {
      const nextUrl = buildUrl(next);
      if (!nextUrl) return;
      const img = new Image();
      img.src = nextUrl;
      loader.push();
      let popped = false;
      const onFinish = () => {
        if (!popped) {
          popped = true;
          loader.pop();
        }
      };
      img.onload = onFinish;
      img.onerror = onFinish;
      return () => {
        img.onload = null;
        img.onerror = null;
        onFinish();
      };
    }
  }, [cacheObj.cache]);

  const go = useCallback(
    (amount: number) => {
      const cache = cacheObj.cache;
      if (!cache || cache.items.length === 0) return null;

      return () => {
        const isSortRandom = data?.sortOrder === "random";
        const nextCursor = isSortRandom
          ? Math.floor(Math.random() * cache.items.length)
          : wrap(cache.cursor + amount, cache.items.length);

        cacheObj.setCache({
          ...cache,
          cursor: nextCursor,
          rotated: Date.now(),
        });
      };
    },
    [cacheObj, data],
  );

  const handlePause = useCallback(() => {
    if (!setData || !data) return;
    setData({ ...data, paused: !data.paused });
  }, [setData, data]);

  return { item, go, handlePause };
}
