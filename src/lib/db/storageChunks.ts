const SYNC_ITEM_TARGET_BYTES = 7_000;
export const SYNC_TOTAL_QUOTA_BYTES = 102_400;
export const SYNC_QUOTA_WARNING_RATIO = 0.8;
export const SYNC_LARGE_VALUE_WARNING_CHUNKS = 8;
const MAX_SYNC_CHUNKS = 32;
const CHUNK_NAMESPACE = "$chunks";
const CHUNK_MANIFEST_TAG = "tabliss-sync-chunks-v1";
const STORED_VALUE_TAG = "tabliss-sync-value-v1";

type ChunkManifest = {
  __tablissStorage: typeof CHUNK_MANIFEST_TAG;
  chunks: number;
  generation: string;
};

type StoredValue = {
  __tablissStorage: typeof STORED_VALUE_TAG;
  value: unknown;
};

export interface SyncChunkSet {
  chunkCount: number;
  generation: string;
}

export interface DecodedSyncStorage {
  entries: Array<[string, unknown]>;
  chunkSets: Map<string, SyncChunkSet>;
}

export interface EncodedSyncValue {
  updates: Record<string, unknown>;
  deletes: string[];
  chunkCount: number;
  generation?: string;
}

export interface SyncChunkUsage {
  key: string;
  chunkCount: number;
  bytes: number;
}

export interface SyncStorageUsage {
  usedBytes: number;
  quotaBytes: number;
  largestChunkedValue?: SyncChunkUsage;
}

const utf8Bytes = (value: string): number =>
  new TextEncoder().encode(value).byteLength;

export const syncItemBytes = (key: string, value: unknown): number => {
  const serialised = JSON.stringify(value);
  if (serialised === undefined) {
    throw new TypeError(
      "Extension sync storage values must be JSON serialisable",
    );
  }
  return utf8Bytes(key) + utf8Bytes(serialised);
};

export const syncStorageBytes = (stored: Record<string, unknown>): number =>
  Object.entries(stored).reduce(
    (total, [key, value]) => total + syncItemBytes(key, value),
    0,
  );

const storageKey = (name: string, key: string): string => `${name}/${key}`;

const assertSafeStorageKey = (key: string): void => {
  if (key.startsWith(`${CHUNK_NAMESPACE}/`)) {
    throw new RangeError(`Sync-storage key uses reserved namespace: ${key}`);
  }
};

export const syncChunkKey = (
  name: string,
  key: string,
  generation: string,
  index: number,
): string =>
  `${name}/${CHUNK_NAMESPACE}/${encodeURIComponent(key)}/${encodeURIComponent(generation)}/${index}`;

const isValidChunkCount = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value > 0 &&
  value <= MAX_SYNC_CHUNKS;

const assertValidChunkCount = (value: number): void => {
  if (!isValidChunkCount(value)) {
    throw new RangeError(`Invalid sync-storage chunk count: ${value}`);
  }
};

const isChunkManifest = (value: unknown): value is ChunkManifest => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ChunkManifest>;
  return (
    candidate.__tablissStorage === CHUNK_MANIFEST_TAG &&
    isValidChunkCount(candidate.chunks) &&
    typeof candidate.generation === "string" &&
    candidate.generation.length > 0
  );
};

const isChunkStorageMarker = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) return false;
  const tag = (value as { __tablissStorage?: unknown }).__tablissStorage;
  return tag === CHUNK_MANIFEST_TAG;
};

const storageTag = (value: unknown): unknown =>
  typeof value === "object" && value !== null
    ? (value as { __tablissStorage?: unknown }).__tablissStorage
    : undefined;

const isStoredValue = (value: unknown): value is StoredValue =>
  storageTag(value) === STORED_VALUE_TAG &&
  Object.prototype.hasOwnProperty.call(value, "value");

const encodeStoredValue = (value: unknown): unknown => {
  const tag = storageTag(value);
  if (tag !== CHUNK_MANIFEST_TAG && tag !== STORED_VALUE_TAG) return value;
  return { __tablissStorage: STORED_VALUE_TAG, value } satisfies StoredValue;
};

const splitSerialisedValue = (
  name: string,
  key: string,
  generation: string,
  serialised: string,
): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < serialised.length) {
    if (chunks.length >= MAX_SYNC_CHUNKS) {
      throw new RangeError("Sync-storage value requires too many chunks");
    }

    const index = chunks.length;
    const keyForChunk = syncChunkKey(name, key, generation, index);
    let low = start + 1;
    let high = serialised.length;
    let best = start;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = serialised.slice(start, middle);

      if (syncItemBytes(keyForChunk, candidate) <= SYNC_ITEM_TARGET_BYTES) {
        best = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    if (best === start) {
      throw new Error(
        "Unable to fit a sync-storage chunk within the item limit",
      );
    }

    chunks.push(serialised.slice(start, best));
    start = best;
  }

  return chunks;
};

export const syncChunkKeys = (
  name: string,
  key: string,
  chunkSet: SyncChunkSet,
): string[] => {
  assertValidChunkCount(chunkSet.chunkCount);
  return Array.from({ length: chunkSet.chunkCount }, (_, index) =>
    syncChunkKey(name, key, chunkSet.generation, index),
  );
};

export const encodeSyncValue = (
  name: string,
  key: string,
  value: unknown,
  previousChunkSet?: SyncChunkSet,
): EncodedSyncValue => {
  assertSafeStorageKey(key);
  const keyInStorage = storageKey(name, key);
  const serialised = JSON.stringify(value);
  if (serialised === undefined) {
    throw new TypeError(
      "Extension sync storage values must be JSON serialisable",
    );
  }

  const storedValue = encodeStoredValue(value);
  if (syncItemBytes(keyInStorage, storedValue) <= SYNC_ITEM_TARGET_BYTES) {
    return {
      updates: { [keyInStorage]: storedValue },
      deletes: previousChunkSet
        ? syncChunkKeys(name, key, previousChunkSet)
        : [],
      chunkCount: 0,
    };
  }

  const generation = crypto.randomUUID();
  const chunks = splitSerialisedValue(name, key, generation, serialised);
  const manifest: ChunkManifest = {
    __tablissStorage: CHUNK_MANIFEST_TAG,
    chunks: chunks.length,
    generation,
  };
  const updates: Record<string, unknown> = { [keyInStorage]: manifest };

  chunks.forEach((chunk, index) => {
    updates[syncChunkKey(name, key, generation, index)] = chunk;
  });

  if (syncStorageBytes(updates) > SYNC_TOTAL_QUOTA_BYTES) {
    throw new RangeError("Sync-storage value exceeds the total quota");
  }

  return {
    updates,
    deletes: previousChunkSet ? syncChunkKeys(name, key, previousChunkSet) : [],
    chunkCount: chunks.length,
    generation,
  };
};

export const syncOrphanChunkDeletes = (
  stored: Record<string, unknown>,
  name: string,
  keys: Iterable<string>,
): string[] => {
  const decoded = decodeSyncStorage(stored, name);
  const deletes: string[] = [];

  for (const key of keys) {
    const keyInStorage = storageKey(name, key);
    const storedValue = stored[keyInStorage];

    // Preserve potentially recoverable data for malformed manifests. A valid
    // write can clean these chunks once it replaces the malformed marker.
    if (isChunkStorageMarker(storedValue) && !isChunkManifest(storedValue)) {
      continue;
    }

    const chunkSet = decoded.chunkSets.get(key);
    const activeChunks = new Set(
      chunkSet ? syncChunkKeys(name, key, chunkSet) : [],
    );
    const chunkPrefix = `${name}/${CHUNK_NAMESPACE}/${encodeURIComponent(key)}/`;

    for (const storedKey of Object.keys(stored)) {
      if (storedKey.startsWith(chunkPrefix) && !activeChunks.has(storedKey)) {
        deletes.push(storedKey);
      }
    }
  }

  return deletes;
};

export const getSyncStorageUsage = (
  stored: Record<string, unknown>,
  name: string,
): SyncStorageUsage => {
  const decoded = decodeSyncStorage(stored, name);
  let largestChunkedValue: SyncChunkUsage | undefined;

  for (const [key, chunkSet] of decoded.chunkSets) {
    const primaryKey = storageKey(name, key);
    let bytes =
      primaryKey in stored ? syncItemBytes(primaryKey, stored[primaryKey]) : 0;

    for (const chunkKey of syncChunkKeys(name, key, chunkSet)) {
      if (chunkKey in stored) {
        bytes += syncItemBytes(chunkKey, stored[chunkKey]);
      }
    }

    if (!largestChunkedValue || bytes > largestChunkedValue.bytes) {
      largestChunkedValue = {
        key,
        chunkCount: chunkSet.chunkCount,
        bytes,
      };
    }
  }

  return {
    usedBytes: syncStorageBytes(stored),
    quotaBytes: SYNC_TOTAL_QUOTA_BYTES,
    largestChunkedValue,
  };
};

export const decodeSyncStorage = (
  stored: Record<string, unknown>,
  name: string,
): DecodedSyncStorage => {
  const prefix = `${name}/`;
  const chunkPrefix = `${prefix}${CHUNK_NAMESPACE}/`;
  const entries: Array<[string, unknown]> = [];
  const chunkSets = new Map<string, SyncChunkSet>();

  for (const [keyInStorage, value] of Object.entries(stored)) {
    if (
      !keyInStorage.startsWith(prefix) ||
      keyInStorage.startsWith(chunkPrefix)
    ) {
      continue;
    }

    const key = keyInStorage.slice(prefix.length);
    if (isStoredValue(value)) {
      entries.push([key, value.value]);
      continue;
    }
    if (!isChunkManifest(value)) {
      if (isChunkStorageMarker(value)) continue;
      entries.push([key, value]);
      continue;
    }

    const chunkSet: SyncChunkSet = {
      chunkCount: value.chunks,
      generation: value.generation,
    };
    chunkSets.set(key, chunkSet);

    const chunks: string[] = [];
    for (let index = 0; index < value.chunks; index += 1) {
      const chunkKey = syncChunkKey(name, key, chunkSet.generation, index);
      const chunk = stored[chunkKey];
      if (typeof chunk !== "string") {
        chunks.length = 0;
        break;
      }
      chunks.push(chunk);
    }

    if (chunks.length !== value.chunks) continue;

    try {
      entries.push([key, JSON.parse(chunks.join(""))]);
    } catch {
      // Keep unrelated sync values available when one chunk set is corrupt.
    }
  }

  return { entries, chunkSets };
};

export const syncChunkDeletes = (
  name: string,
  key: string,
  chunkSet?: SyncChunkSet,
): string[] => {
  assertSafeStorageKey(key);
  return [
    storageKey(name, key),
    ...(chunkSet ? syncChunkKeys(name, key, chunkSet) : []),
  ];
};
