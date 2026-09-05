import * as DB from "./db";
import * as Stream from "./stream";

/** IndexedDB storage provider */
// TODO: clean up indexeddb usage, convert to promises and double check error handling

const EXTENSION_SAVE_BATCH_TIMEOUT = 1000; // 1s
const SYNC_STORAGE_ITEM_QUOTA = 8192;
const SYNC_STORAGE_TOTAL_QUOTA = 102400;
const CHUNK_PATH = "/$chunks/"; // Legacy PR format; read compatibility only.
const encoder = new TextEncoder();
const CHUNK_MANIFEST = "__tablissChunks";

type ChunkManifest = {
  [CHUNK_MANIFEST]: string[];
  version?: 2;
  digest?: string;
};

const storageBytes = (key: string, value: unknown): number =>
  encoder.encode(key).byteLength +
  encoder.encode(JSON.stringify(value)).byteLength;

const describeStorageError = (error: unknown): string => {
  if (error instanceof Error) return error.toString();
  if (typeof error === "string" && error) return error;
  return "The browser did not provide details for this storage failure.";
};

const hasChunkMarker = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && CHUNK_MANIFEST in value;

const isChunkManifest = (value: unknown): value is ChunkManifest =>
  hasChunkMarker(value) &&
  Array.isArray(value[CHUNK_MANIFEST]) &&
  value[CHUNK_MANIFEST].every((key) => typeof key === "string");

// Outside the database namespace, so even keys containing /$chunks/ are data.
const chunkPrefix = (name: string, key: string) =>
  `/$tablissChunks/${encodeURIComponent(name)}/${encodeURIComponent(key)}/`;

const digest = async (value: string): Promise<string> =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(value)),
    ),
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const chunkValue = async (
  name: string,
  key: string,
  value: unknown,
): Promise<Record<string, unknown>> => {
  const serialized = JSON.stringify(value);
  if (encoder.encode(serialized).byteLength > SYNC_STORAGE_TOTAL_QUOTA) {
    throw new Error(`Value exceeds total sync storage quota: ${key}`);
  }
  const chunks: string[] = [];
  const updates: Record<string, unknown> = {};
  let offset = 0;
  const generation = `${chunkPrefix(name, key)}${crypto.randomUUID()}/`;

  while (offset < serialized.length) {
    const chunkKey = `${generation}${chunks.length}`;
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

  updates[key] = {
    [CHUNK_MANIFEST]: chunks,
    version: 2,
    digest: await digest(serialized),
  } satisfies ChunkManifest;
  if (storageBytes(key, updates[key]) > SYNC_STORAGE_ITEM_QUOTA) {
    throw new Error(`Storage manifest is too large: ${key}`);
  }
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
  // Web Locks coordinate tabs on this device. Remote sync is not transactional;
  // immutable generations and checksums prevent accepting a mixed payload.
  const locked = <T>(run: () => Promise<T>): Promise<T> =>
    typeof navigator !== "undefined" && navigator.locks
      ? navigator.locks.request(`tabliss-storage:${area}:${name}`, run)
      : run();

  const manifestKeys = (key: string, value: ChunkManifest): string[] => {
    const keys = value[CHUNK_MANIFEST];
    const prefix = chunkPrefix(name, key);
    if (
      keys.length === 0 ||
      new Set(keys).size !== keys.length ||
      !keys.every((chunkKey, index) =>
        value.version === 2
          ? chunkKey.startsWith(prefix) &&
            /^[0-9a-f-]{36}\/\d+$/.test(chunkKey.slice(prefix.length)) &&
            chunkKey ===
              `${keys[0].slice(0, keys[0].lastIndexOf("/") + 1)}${index}`
          : value.version === undefined &&
            chunkKey === `${key}${CHUNK_PATH}${index}`,
      )
    ) {
      throw new Error(`Invalid chunk manifest: ${key}`);
    }
    return keys;
  };

  // Load healthy keys even if another record is damaged. Reject initialization
  // afterwards so migrations/defaults cannot overwrite recoverable stored data.
  await locked(async () => {
    try {
      const stored = await storageArea.get();
      const internalKeys = new Set<string>();
      const restored: DB.Change[] = [];
      const failures: string[] = [];
      for (const [key, value] of Object.entries(stored)) {
        if (!key.startsWith(`${name}/`)) continue;
        try {
          if (area === "sync" && hasChunkMarker(value)) {
            if (!isChunkManifest(value))
              throw new Error(`Invalid chunk manifest: ${key}`);
            const keys = manifestKeys(key, value);
            keys.forEach((chunkKey) => internalKeys.add(chunkKey));
            if (
              !keys.every((chunkKey) => typeof stored[chunkKey] === "string")
            ) {
              throw new Error(`Missing or non-string chunk: ${key}`);
            }
            const serialized = keys
              .map((chunkKey) => stored[chunkKey])
              .join("");
            if (
              value.version === 2 &&
              (await digest(serialized)) !== value.digest
            ) {
              throw new Error(`Chunk checksum mismatch: ${key}`);
            }
            restored.push([key, JSON.parse(serialized)]);
          } else {
            restored.push([key, value]);
          }
        } catch (error) {
          failures.push(describeStorageError(error));
        }
      }
      DB.atomic(db, (trx) => {
        for (const [key, value] of restored) {
          if (!internalKeys.has(key))
            DB.put(trx, key.substring(name.length + 1), value);
        }
      });
      if (failures.length) throw new Error(failures.join("; "));
    } catch (error) {
      throw mapError("Cannot read from storage", error);
    }
  });

  const errors = Stream.init<StorageError>();
  const handleError = (message: string) => (err: unknown) => {
    Stream.publish(errors, mapError(message, err));
  };
  // Only unreachable immutable chunks go here, never a logical data key.
  const pendingCleanup = new Set<string>();
  const cleanup = async () => {
    if (!pendingCleanup.size) return;
    try {
      // A rejected write may have reached storage before its acknowledgement
      // failed. Never remove chunks that a current manifest still references.
      const stored = await storageArea.get();
      const referenced = new Set<string>();
      for (const value of Object.values(stored)) {
        if (hasChunkMarker(value) && Array.isArray(value[CHUNK_MANIFEST])) {
          for (const key of value[CHUNK_MANIFEST]) {
            if (typeof key === "string") referenced.add(key);
          }
        }
      }
      const unreachable = [...pendingCleanup].filter(
        (key) => !referenced.has(key),
      );
      if (unreachable.length) await storageArea.remove(unreachable);
      unreachable.forEach((key) => pendingCleanup.delete(key));
    } catch (error) {
      handleError("Cannot write deletes to storage")(error);
    }
  };
  const saveChanges = async (changesArray: DB.Change[]): Promise<void> =>
    locked(async () => {
      await cleanup();
      // Refresh inside the lock: another tab may have replaced a generation.
      const stored = await storageArea.get();
      const updates: Record<string, unknown> = {};
      const chunks: Record<string, unknown> = {};
      const obsolete: string[] = [];
      const deletes = new Map<string, string[]>();
      for (const [key, val] of changesArray) {
        const storageKey = `${name}/${key}`;
        try {
          const previous = stored[storageKey];
          if (
            area === "sync" &&
            hasChunkMarker(previous) &&
            !isChunkManifest(previous)
          ) {
            throw new Error(`Invalid chunk manifest: ${storageKey}`);
          }
          const oldChunkKeys =
            area === "sync" && isChunkManifest(previous)
              ? manifestKeys(storageKey, previous)
              : [];
          if (val === undefined) {
            deletes.set(storageKey, oldChunkKeys);
            continue;
          }
          if (
            area === "sync" &&
            (storageBytes(storageKey, val) > SYNC_STORAGE_ITEM_QUOTA ||
              hasChunkMarker(val) ||
              // Chrome normalizes lone surrogates in raw strings. JSON's escaped
              // representation preserves them, including inside nested values.
              /\\u[dD][89a-fA-F][0-9a-fA-F]{2}/.test(JSON.stringify(val)))
          ) {
            const chunked = await chunkValue(name, storageKey, val);
            updates[storageKey] = chunked[storageKey];
            delete chunked[storageKey];
            Object.assign(chunks, chunked);
          } else {
            updates[storageKey] = val;
          }
          obsolete.push(...oldChunkKeys);
        } catch (error) {
          handleError("Cannot prepare value for storage")(error);
        }
      }
      try {
        // Copy-on-write: publish pointers only after all chunks are durable.
        // This deliberately needs space for both old and new generations.
        // Keep writes batched to respect Chrome's write-operation quota.
        if (Object.keys(chunks).length) await storageArea.set(chunks);
        if (Object.keys(updates).length) await storageArea.set(updates);
      } catch (error) {
        Object.keys(chunks).forEach((key) => pendingCleanup.add(key));
        obsolete.forEach((key) => pendingCleanup.add(key));
        handleError("Cannot write updates to storage")(error);
        await cleanup();
        return;
      }
      obsolete.forEach((key) => {
        if (!Object.hasOwn(updates, key)) pendingCleanup.add(key);
      });
      if (deletes.size) {
        try {
          // Delete pointers first. A failed delete must retain their payloads.
          await storageArea.remove([...deletes.keys()]);
          for (const keys of deletes.values()) {
            keys.forEach((key) => pendingCleanup.add(key));
          }
        } catch (error) {
          handleError("Cannot write deletes to storage")(error);
        }
      }
      await cleanup();
    });
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
