import * as DB from "./db";
import * as Stream from "./stream";

/** IndexedDB storage provider */
// TODO: clean up indexeddb usage, convert to promises and double check error handling

const EXTENSION_SAVE_BATCH_TIMEOUT = 1000; // 1s
const SYNC_STORAGE_ITEM_QUOTA = 8192;
const CHUNK_PATH = "/$chunks/";
const CHUNK_MANIFEST = "__tablissChunks";

type ChunkManifest = {
  [CHUNK_MANIFEST]: string[];
};

const storageBytes = (key: string, value: unknown): number =>
  new TextEncoder().encode(key).byteLength +
  new TextEncoder().encode(JSON.stringify(value)).byteLength;

const describeStorageError = (error: unknown): string => {
  const name = error instanceof Error ? error.name : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const detail = `${name} ${message}`.trim();
  const normalized = detail.toLowerCase();

  if (
    normalized.includes("max_write_operations") ||
    normalized.includes("write operations") ||
    normalized.includes("write-rate") ||
    normalized.includes("write rate")
  ) {
    return "The browser sync write-rate limit was exceeded. Try again later.";
  }
  if (
    normalized.includes("quota_bytes_per_item") ||
    normalized.includes("per-item") ||
    normalized.includes("item exceeds")
  ) {
    return "An individual item exceeds the browser storage limit.";
  }
  if (normalized.includes("quota") || normalized.includes("storage is full")) {
    return "The browser storage quota is full.";
  }
  if (
    normalized.includes("not writable") ||
    normalized.includes("not a writable") ||
    normalized.includes("read-only") ||
    normalized.includes("read only")
  ) {
    return "The requested storage area is read-only.";
  }
  if (
    normalized.includes("context invalidated") ||
    normalized.includes("context is unavailable")
  ) {
    return "The extension context is unavailable. Reload TablissNG and try again.";
  }
  if (
    normalized.includes("permission") ||
    normalized.includes("access denied") ||
    normalized.includes("not allowed")
  ) {
    return "The browser denied access to extension storage.";
  }
  if (
    normalized.includes("circular") ||
    normalized.includes("bigint") ||
    normalized.includes("serialize") ||
    normalized.includes("datacloneerror")
  ) {
    return "The value could not be serialized for storage.";
  }
  if (detail) return `Browser error: ${detail}`;
  return "The browser did not provide details for this storage failure.";
};

const isChunkManifest = (value: unknown): value is ChunkManifest =>
  typeof value === "object" &&
  value !== null &&
  CHUNK_MANIFEST in value &&
  Array.isArray(value[CHUNK_MANIFEST]) &&
  value[CHUNK_MANIFEST].every((key) => typeof key === "string");

const chunkValue = (key: string, value: unknown): Record<string, unknown> => {
  const serialized = JSON.stringify(value);
  const chunks: string[] = [];
  const updates: Record<string, unknown> = {};
  let offset = 0;

  while (offset < serialized.length) {
    const chunkKey = `${key}${CHUNK_PATH}${chunks.length}`;
    let low = offset + 1;
    let high = serialized.length;
    let end = offset;

    while (low <= high) {
      const midpoint = Math.floor((low + high) / 2);
      const candidateEnd =
        midpoint < serialized.length &&
        /[\uD800-\uDBFF]/.test(serialized[midpoint - 1]) &&
        /[\uDC00-\uDFFF]/.test(serialized[midpoint])
          ? midpoint - 1
          : midpoint;
      const candidate = serialized.slice(offset, candidateEnd);

      if (storageBytes(chunkKey, candidate) <= SYNC_STORAGE_ITEM_QUOTA) {
        end = candidateEnd;
        low = midpoint + 1;
      } else {
        high = midpoint - 1;
      }
    }

    if (end === offset) {
      throw new Error(`Storage key is too large to chunk: ${key}`);
    }

    chunks.push(chunkKey);
    updates[chunkKey] = serialized.slice(offset, end);
    offset = end;
  }

  updates[key] = { [CHUNK_MANIFEST]: chunks } satisfies ChunkManifest;
  return updates;
};

export const indexeddb = (
  db: DB.Database,
  name: string,
): Promise<Stream.Stream<StorageError>> => {
  // Map idb errors to a standard format
  const mapError = (message: string, err: unknown): StorageError => {
    const cause =
      err instanceof Event &&
      err.target instanceof IDBRequest &&
      err.target.error instanceof Error
        ? err.target.error
        : undefined;
    return new StorageError(
      `IndexedDB: ${name}: ${message} — ${describeStorageError(cause ?? err)}`,
      { cause },
    );
  };

  return new Promise((resolve, reject) => {
    const rejectError = (message: string) => (err: unknown) => {
      reject(mapError(message, err));
    };

    const open = indexedDB.open(name, 1);
    open.onerror = rejectError("Cannot open database");
    open.onupgradeneeded = () => {
      open.result.createObjectStore("changes");
    };
    open.onsuccess = () => {
      const conn = open.result;

      const trx = conn.transaction("changes", "readonly");
      trx.onerror = rejectError("Cannot read changes from store");

      const changes: DB.Change[] = [];
      const cursor = trx.objectStore("changes").openCursor();
      cursor.onsuccess = () => {
        if (cursor.result) {
          if (typeof cursor.result.key === "string")
            changes.push([cursor.result.key, cursor.result.value]);
          cursor.result.continue();
        } else {
          // Finished loading
          DB.atomic(db, (trx) => {
            changes.forEach(([key, val]) => DB.put(trx, key, val));
          });

          // Write
          const errors = Stream.init<StorageError>();
          DB.listen(
            db,
            batch((changes) => {
              if (DEV) console.log("Storage: saving changes:", changes);

              const trx = conn.transaction("changes", "readwrite");
              trx.oncomplete = () => {}; // nice
              trx.onerror = (error) =>
                Stream.publish(
                  errors,
                  mapError("Cannot write changes to store", error),
                );

              const store = trx.objectStore("changes");
              // TODO: iterator helpers
              for (const [key, val] of changes) {
                if (val === undefined) store.delete(key);
                else store.put(val, key);
              }
            }),
          );
          resolve(errors);
        }
      };
    };
  });
};

/** Web Extension storage provider */
export const extension = async (
  db: DB.Database,
  name: string,
  area: "local" | "sync" | "managed",
): Promise<Stream.Stream<StorageError>> => {
  // Map errors to a standard format
  const mapError = (message: string, err: unknown) =>
    new StorageError(
      `Extension[${area}]: ${name}: ${message} — ${describeStorageError(err)}`,
      { cause: err instanceof Error ? err : undefined },
    );

  const storageArea = browser.storage[area];
  const chunkKeysByStorageKey = new Map<string, string[]>();

  // Pull
  await storageArea
    .get()
    .then((stored) => {
      Object.keys(stored)
        .filter(
          (key) => key.startsWith(`${name}/`) && !key.includes(CHUNK_PATH),
        )
        .forEach((key) => {
          const value = stored[key];
          if (isChunkManifest(value)) {
            chunkKeysByStorageKey.set(key, value[CHUNK_MANIFEST]);
          }
          const restored = isChunkManifest(value)
            ? JSON.parse(
                value[CHUNK_MANIFEST].map((chunkKey) => stored[chunkKey]).join(
                  "",
                ),
              )
            : value;
          DB.put(db, key.substring(name.length + 1), restored);
        });
    })
    .catch((error) => {
      throw mapError("Cannot read from storage", error);
    });

  // Push
  const errors = Stream.init<StorageError>();
  const handleError = (message: string) => (err: unknown) => {
    Stream.publish(errors, mapError(message, err));
  };
  const saveChanges = async (changesArray: DB.Change[]): Promise<void> => {
    // TODO: iterator helpers
    const updates: Record<string, unknown> = {};
    const deletes = new Set<string>();
    const nextChunkKeys = new Map(chunkKeysByStorageKey);

    for (const [key, val] of changesArray) {
      const storageKey = `${name}/${key}`;
      const oldChunkKeys = chunkKeysByStorageKey.get(storageKey) ?? [];

      try {
        if (val === undefined) {
          deletes.add(storageKey);
          oldChunkKeys.forEach((chunkKey) => deletes.add(chunkKey));
          nextChunkKeys.delete(storageKey);
        } else if (
          area === "sync" &&
          storageBytes(storageKey, val) > SYNC_STORAGE_ITEM_QUOTA
        ) {
          const chunked = chunkValue(storageKey, val);
          Object.assign(updates, chunked);
          const manifest = chunked[storageKey];
          if (!isChunkManifest(manifest)) {
            throw new Error("Chunked storage value is missing its manifest");
          }
          const newChunkKeys = manifest[CHUNK_MANIFEST];
          oldChunkKeys
            .filter((chunkKey) => !newChunkKeys.includes(chunkKey))
            .forEach((chunkKey) => deletes.add(chunkKey));
          nextChunkKeys.set(storageKey, newChunkKeys);
        } else {
          updates[storageKey] = val;
          oldChunkKeys.forEach((chunkKey) => deletes.add(chunkKey));
          nextChunkKeys.delete(storageKey);
        }
      } catch (error) {
        handleError("Cannot prepare value for storage")(error);
      }
    }

    if (Object.keys(updates).length > 0) {
      try {
        await storageArea.set(updates);
      } catch (error) {
        handleError("Cannot write updates to storage")(error);
        return;
      }
    }

    for (const [key] of changesArray) {
      const storageKey = `${name}/${key}`;
      const chunkKeys = nextChunkKeys.get(storageKey);
      if (chunkKeys) chunkKeysByStorageKey.set(storageKey, chunkKeys);
      else chunkKeysByStorageKey.delete(storageKey);
    }

    if (deletes.size > 0) {
      try {
        await storageArea.remove([...deletes]);
      } catch (error) {
        handleError("Cannot write deletes to storage")(error);
      }
    }
  };
  let writeQueue = Promise.resolve();
  DB.listen(
    db,
    batch((changes) => {
      if (DEV) console.log("Storage: saving changes:", changes);
      const changesArray = Array.from(changes);
      writeQueue = writeQueue
        .then(() => saveChanges(changesArray))
        .catch(handleError("Cannot save changes to storage"));
    }, EXTENSION_SAVE_BATCH_TIMEOUT),
  );

  return errors;
};

const batch = (
  flush: (batch: Iterable<DB.Change>) => void,
  timeout = 0,
): DB.Listener => {
  const changes = new Map();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = () => {
    flush(changes);
    changes.clear();
    timer = null;
  };

  // If there are pending changes on browser close, flush immediately
  window.addEventListener("beforeunload", () => {
    if (timer) {
      clearTimeout(timer);
      run();
    }
  });

  return ([key, val]) => {
    changes.set(key, val);
    if (!timer) timer = setTimeout(run, timeout);
  };
};

/** Storage Error */
class StorageError extends Error {
  override name = "StorageError";
}
