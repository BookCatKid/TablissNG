import * as DB from "./db";
import {
  decodeSyncStorage,
  encodeSyncValue,
  getSyncStorageUsage,
  SYNC_TOTAL_QUOTA_BYTES,
  syncChunkDeletes,
  syncOrphanChunkDeletes,
  syncStorageBytes,
} from "./storageChunks";
import { publishSyncStorageUsage } from "./storageQuota";
import * as Stream from "./stream";

/** IndexedDB storage provider */
// TODO: clean up indexeddb usage, convert to promises and double check error handling

const EXTENSION_SAVE_BATCH_TIMEOUT = 1000; // 1s

export const indexeddb = (
  db: DB.Database,
  name: string,
): Promise<Stream.Stream<StorageError>> => {
  // Map idb errors to a standard format
  const mapError = (message: string, err: unknown): StorageError => {
    const target = err instanceof Event ? err.target : null;
    const targetError =
      target && "error" in target
        ? (target as IDBRequest | IDBTransaction).error
        : null;
    const cause =
      targetError instanceof Error
        ? targetError
        : err instanceof Error
          ? err
          : undefined;
    return new StorageError(`IndexedDB: ${name}: ${message}`, { cause });
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
    new StorageError(`Extension[${area}]: ${name}: ${message}`, {
      cause: err instanceof Error ? err : undefined,
    });

  const storageArea = browser.storage[area];

  const publishUsage = (stored: Record<string, unknown>): void => {
    if (area === "sync") {
      publishSyncStorageUsage(getSyncStorageUsage(stored, name));
    }
  };

  // Pull
  await storageArea
    .get()
    .then((stored) => {
      if (area === "sync") {
        const decoded = decodeSyncStorage(stored, name);
        decoded.entries.forEach(([key, value]) => DB.put(db, key, value));
        publishUsage(stored);
        return;
      }

      Object.keys(stored)
        .filter((key) => key.startsWith(`${name}/`))
        .forEach((key) =>
          DB.put(db, key.substring(name.length + 1), stored[key]),
        );
    })
    .catch((error) => {
      throw mapError("Cannot read from storage", error);
    });

  // Push
  const errors = Stream.init<StorageError>();
  const handleError = (message: string) => (err: unknown) => {
    Stream.publish(errors, mapError(message, err));
  };

  if (area === "sync") {
    browser.storage.onChanged.addListener((_changes, changedArea) => {
      if (changedArea !== "sync") return;
      storageArea
        .get()
        .then(publishUsage)
        .catch(handleError("Cannot read sync-storage usage"));
    });
  }

  let syncWriteQueue = Promise.resolve();
  DB.listen(
    db,
    batch((changes) => {
      if (DEV) console.log("Storage: saving changes:", changes);

      // TODO: test for both updates and deletes for the same key
      // TODO: iterator helpers
      const changesArray = Array.from(changes);

      if (area === "sync") {
        syncWriteQueue = syncWriteQueue
          .then(async () => {
            const stored = await storageArea.get();
            const currentChunkSets = decodeSyncStorage(stored, name).chunkSets;
            const updates: Record<string, unknown> = {};
            const deletes: string[] = [];
            const changedKeys = new Set<string>();

            for (const [key, val] of changesArray) {
              changedKeys.add(key);
              const previousChunkSet = currentChunkSets.get(key);

              if (val === undefined) {
                deletes.push(...syncChunkDeletes(name, key, previousChunkSet));
                continue;
              }

              const encoded = encodeSyncValue(name, key, val, previousChunkSet);
              Object.assign(updates, encoded.updates);
              deletes.push(...encoded.deletes);
            }

            // Account for stale generations in cleanup and the final quota
            // check.
            deletes.push(...syncOrphanChunkDeletes(stored, name, changedKeys));
            const deleteKeys = Array.from(new Set(deletes));

            const predictedStorage = { ...stored };
            for (const key of deleteKeys) delete predictedStorage[key];
            Object.assign(predictedStorage, updates);
            if (syncStorageBytes(predictedStorage) > SYNC_TOTAL_QUOTA_BYTES) {
              throw new RangeError("Sync storage quota would be exceeded");
            }

            const hasUpdates = Object.keys(updates).length > 0;
            if (hasUpdates) {
              // Preserve the previous value until its replacement is
              // committed.
              await storageArea.set(updates);
            }
            if (deleteKeys.length > 0) {
              await storageArea.remove(deleteKeys);
            }

            const postWriteStorage = await storageArea.get();
            const orphanedChunks = syncOrphanChunkDeletes(
              postWriteStorage,
              name,
              changedKeys,
            );
            if (orphanedChunks.length > 0) {
              await storageArea.remove(orphanedChunks);
              const cleanedStorage = { ...postWriteStorage };
              orphanedChunks.forEach((key) => delete cleanedStorage[key]);
              publishUsage(cleanedStorage);
            } else {
              publishUsage(postWriteStorage);
            }
          })
          .catch(handleError("Cannot write changes to storage"));
        return;
      }

      const updates = Object.fromEntries(
        changesArray
          .filter(([, val]) => val !== undefined)
          .map(([key, val]) => [`${name}/${key}`, val]),
      );
      const deletes = changesArray
        .filter(([, val]) => val === undefined)
        .map(([key]) => `${name}/${key}`);

      storageArea
        .set(updates)
        .catch(handleError("Cannot write updates to storage"));
      storageArea
        .remove(deletes)
        .catch(handleError("Cannot write deletes to storage"));
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
