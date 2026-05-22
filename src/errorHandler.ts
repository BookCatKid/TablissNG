export type ErrorLogEntry = {
  timestamp: string;
  message: string;
  stack?: string;
};

const errorLog: ErrorLogEntry[] = [];
const listeners: Array<(entry: ErrorLogEntry) => void> = [];

/** Subscribe to new error log entries. Returns an unsubscribe function. */
export function onError(listener: (entry: ErrorLogEntry) => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/** Record an error to the in-memory log */
export function capture(error: unknown): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };
  errorLog.push(entry);
  for (const fn of listeners) {
    try {
      fn(entry);
    } catch {
      // Prevent a failing listener from blocking others
    }
  }
}

/** Get all recorded error log entries */
export function getErrorLog(): ReadonlyArray<ErrorLogEntry> {
  return errorLog;
}

/** Format the entire error log as a shareable string */
export function formatErrorLog(): string {
  if (errorLog.length === 0) {
    return "No errors recorded.";
  }
  return errorLog
    .map(
      (entry, i) =>
        `--- Error ${i + 1} [${entry.timestamp}] ---\n${entry.message}${entry.stack ? `\n${entry.stack}` : ""}`,
    )
    .join("\n\n");
}
