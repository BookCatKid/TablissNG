import { useEffect, useState } from "react";

import { runWhenIdle } from "../utils";

/**
 * Defers the application of a favicon src URL to prevent favicon
 * network requests/404s from blocking the extension's critical boot
 * sequence, window.onload event, and connection pools.
 */
export function useDeferredFavicon(src: string): string {
  const [deferredSrc, setDeferredSrc] = useState("");

  useEffect(() => {
    return runWhenIdle(() => setDeferredSrc(src), {
      delay: src ? 500 : 0,
      timeout: 2000,
    });
  }, [src]);

  return deferredSrc;
}
