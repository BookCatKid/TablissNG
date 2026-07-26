import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_RESET_DELAY = 2000;

/**
 * Hook that provides clipboard copy functionality with automatic state reset.
 *
 * Manages both `copied` and `error` states internally — callers just invoke
 * `copy(text)` and read the returned booleans for UI feedback.
 */
export function useClipboard(resetDelay = DEFAULT_RESET_DELAY) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      setError(false);

      if (!navigator?.clipboard?.writeText) {
        console.warn("Clipboard API writeText not available");
        setError(true);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setError(false), resetDelay);
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        setError(false);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetDelay);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        setCopied(false);
        setError(true);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setError(false), resetDelay);
      }
    },
    [resetDelay],
  );

  return { copy, copied, error } as const;
}
