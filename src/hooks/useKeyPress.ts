import { useEffect } from "react";

function isInputEvent(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest("input, textarea, select, button") ||
    target.isContentEditable ||
    target.closest('[contenteditable]:not([contenteditable="false"])'),
  );
}

export function useKeyPress(
  callback: ((event: KeyboardEvent) => void) | null | undefined,
  detectKeys: string[],
  ignoreInputEvents = true,
) {
  useEffect(() => {
    if (!callback) return;

    const handler = (event: KeyboardEvent) => {
      if (
        detectKeys.includes(event.key) &&
        !(ignoreInputEvents && isInputEvent(event)) &&
        !(event.ctrlKey || event.metaKey || event.altKey)
      ) {
        callback(event);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [ignoreInputEvents, callback]);
}
