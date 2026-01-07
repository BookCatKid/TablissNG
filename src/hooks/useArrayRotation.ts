import React from "react";
import { Loader } from "../plugins/types";

type Options<T> = {
  items: T[];
  buildUrl: (item: T) => string | null;
  data?: { paused?: boolean; timeout?: number };
  setData?: (data: any) => void;
  loader?: Loader;
  deps?: unknown[];
  preload?: boolean;
};

export function useArrayRotation<T>({
  items,
  buildUrl,
  data,
  setData,
  loader,
  deps = [],
  preload = true,
}: Options<T>) {
  const [cursor, setCursor] = React.useState(0);
  const rotatedRef = React.useRef(Date.now());

  // keep cursor in range if items change
  React.useEffect(() => {
    if (items.length === 0) {
      setCursor(0);
      return;
    }
    setCursor((c) => Math.min(c, items.length - 1));
  }, [items.length]);

  const timeoutMs = data
    ? data.paused
      ? Number.MAX_SAFE_INTEGER
      : (data.timeout ?? 0) * 1000
    : 0;

  // advance on timeout
  React.useEffect(() => {
    if (!items || items.length <= 1) return;
    if (timeoutMs === 0 || timeoutMs === Number.MAX_SAFE_INTEGER) return;
    const id = setTimeout(() => {
      setCursor((c) => {
        const next = (c + 1) % items.length;
        rotatedRef.current = Date.now();
        return next;
      });
    }, timeoutMs);
    return () => clearTimeout(id);
  }, [cursor, timeoutMs, items.length, ...deps]);

  // preload next (optional). Uses stable dependencies to avoid running on every render.
  React.useEffect(() => {
    if (!preload) return;
    if (!items || items.length <= 1 || !buildUrl || !loader) return;
    const nextIndex = (cursor + 1) % items.length;
    const next = items[nextIndex];
    const url = buildUrl(next);
    if (!url) return;
    const img = new Image();
    img.src = url;
    const onFinish = () => loader.pop();
    img.onload = onFinish;
    img.onerror = onFinish;
    loader.push();
    return () => {
      // revoke if buildUrl created an object URL
      try {
        // some URLs (object URLs) can be revoked safely
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
      img.onload = null;
      img.onerror = null;
    };
  }, [cursor, items.length, preload]);

  const go = React.useCallback(
    (amount: number) => {
      if (!items || items.length === 0) return null;
      const target = cursor + amount;
      if (target < 0 || target >= items.length) return null;
      return () => {
        setCursor(target);
        rotatedRef.current = Date.now();
      };
    },
    [cursor, items],
  );

  const handlePause = React.useCallback(() => {
    if (setData && data) {
      setData({ ...data, paused: !data.paused });
      return;
    }
    // otherwise do nothing (no persistent data)
  }, [setData, data]);

  return { item: items[cursor], go, handlePause, cursor };
}

export default useArrayRotation;
