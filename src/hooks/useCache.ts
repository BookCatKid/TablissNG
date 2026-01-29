import { EffectCallback, useEffect, useMemo, useRef } from "react";
import { Cache } from "../plugins";
import { useTime } from "./useTime";
import { wrap } from "../utils";

/**
 * A cached effect that automatically reruns after the expires time or on deps change.
 */
export function useCachedEffect(
  effect: EffectCallback,
  expires: Date | number,
  deps: unknown[],
) {
  const time = useTime("absolute");
  const prevDeps = useRef(deps);
  const prevExpires = useRef<Date | number | undefined>(undefined);

  useEffect(() => {
    const depsChanged = !areDepsEqual(prevDeps.current, deps);
    const expired = time >= expires && expires !== prevExpires.current;

    if (depsChanged || expired) {
      prevDeps.current = deps;
      prevExpires.current = expires;
      return effect();
    }
  }, [...deps, expires, time]);
}

export type RotatingCache<Item> = {
  items: Item[];
  cursor: number;
  rotated: number;
  deps: unknown[];
};

/**
 * A cache which rotates through a list of items
 */
export function useRotatingCache<T>(
  fetch: () => Promise<T[]>,
  { cache, setCache }: Cache<RotatingCache<T>>,
  timeout: number,
  deps: unknown[],
): T | undefined {
  const isValidCache =
    !!cache &&
    Array.isArray(cache.items) &&
    typeof cache.cursor === "number" &&
    typeof cache.rotated === "number";
  // Find cursor
  const time = useTime("absolute").getTime();
  const boot = useRef(true);
  const cursor = useMemo(() => {
    if (!isValidCache) return 0;

    if (
      (timeout === 0 && boot.current) ||
      (timeout !== 0 && time > cache.rotated + timeout)
    ) {
      const cursor = cache.cursor + 1;
      setCache({ ...cache, cursor, rotated: Date.now() });
      boot.current = false;
      return cursor;
    }
    boot.current = false;
    return cache.cursor;
  }, [cache, time, timeout]);

  // Fetch more when cursor reaches end
  useEffect(() => {
    if (
      isValidCache &&
      Array.isArray(cache.items) &&
      cursor >= cache.items.length - 1
    ) {
      // fetch more; preserve up to the last 10 existing items
      fetch().then((items) => {
        if (items.length === 0) {
          return;
        }
        const preserved = cache.items.slice(-10);
        const newItems = [...preserved, ...items];
        // place cursor on the last preserved item so the next rotation moves into new items
        const newCursor = Math.max(0, preserved.length - 1);
        setCache({
          ...cache,
          items: newItems,
          cursor: newCursor,
        });
      });
    }
  }, [cursor]);

  // Refresh of deps change
  useEffect(() => {
    if (!isValidCache || !areDepsEqual(deps, cache?.deps ?? [])) {
      fetch().then((items) =>
        setCache({ items, cursor: 0, rotated: Date.now(), deps }),
      );
    }
  }, [cache?.deps, ...deps]);

  if (!isValidCache) return undefined;
  const { items } = cache;
  if (!Array.isArray(items) || typeof cursor !== "number") return undefined;

  // Final safety check to ensure cursor is within bounds for the current render
  if (items.length === 0) return undefined;
  const safeCursor = wrap(cursor, items.length);

  return items[safeCursor];
}

/**
 * Implementation adapted from react's hook source.
 * Too bad they do not export it.
 */
function areDepsEqual(prevDeps: unknown[], nextDeps: unknown[]) {
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
