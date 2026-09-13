import {
  decodeSyncStorage,
  encodeSyncValue,
  SYNC_TOTAL_QUOTA_BYTES,
  syncChunkDeletes,
  syncChunkKeys,
  syncItemBytes,
  syncOrphanChunkDeletes,
  syncStorageBytes,
} from "./storageChunks";

const NAME = "tabliss/config";
const KEY = "data/links";

const makeLargeValue = (marker = "x") => ({
  links: Array.from({ length: 70 }, (_, index) => ({
    id: `link-${index}`,
    name: `Example ${index}`,
    url: `https://example.com/${index}?value=${marker.repeat(80)}`,
    lastUsed: 1_700_000_000_000 + index,
  })),
});

test("keeps small sync values in the single-item layout", () => {
  const value = { links: [{ id: "one", url: "https://example.com" }] };
  const encoded = encodeSyncValue(NAME, KEY, value);

  expect(encoded.chunkCount).toBe(0);
  expect(encoded.updates).toEqual({ [`${NAME}/${KEY}`]: value });
  expect(decodeSyncStorage(encoded.updates, NAME).entries).toEqual([
    [KEY, value],
  ]);
});

test("round-trips user values that look like internal storage markers", () => {
  const values = [
    {
      __tablissStorage: "tabliss-sync-chunks-v1",
      chunks: 1,
      generation: "this-is-user-data",
    },
    {
      __tablissStorage: "tabliss-sync-chunks-v1",
      chunks: "not-a-manifest",
    },
    {
      __tablissStorage: "tabliss-sync-value-v1",
      value: { nested: true },
    },
  ];

  for (const [index, value] of values.entries()) {
    const key = `data/marker-${index}`;
    const encoded = encodeSyncValue(NAME, key, value);
    expect(decodeSyncStorage(encoded.updates, NAME).entries).toEqual([
      [key, value],
    ]);
  }
});

test("rejects logical keys that collide with the internal chunk namespace", () => {
  expect(() =>
    encodeSyncValue(NAME, "$chunks/user-data", { important: true }),
  ).toThrow("Sync-storage key uses reserved namespace");
  expect(() => syncChunkDeletes(NAME, "$chunks/user-data")).toThrow(
    "Sync-storage key uses reserved namespace",
  );
});

test("chunks values into a generation-scoped set below Firefox's item quota", () => {
  const value = makeLargeValue();
  const encoded = encodeSyncValue(NAME, KEY, value);

  expect(encoded.chunkCount).toBeGreaterThan(1);
  expect(encoded.generation).toEqual(expect.any(String));
  for (const [key, storedValue] of Object.entries(encoded.updates)) {
    expect(syncItemBytes(key, storedValue)).toBeLessThan(8_192);
  }

  const decoded = decodeSyncStorage(encoded.updates, NAME);
  expect(decoded.entries).toEqual([[KEY, value]]);
  expect(decoded.chunkSets.get(KEY)).toEqual({
    chunkCount: encoded.chunkCount,
    generation: encoded.generation,
  });
});

test("chunks Unicode data by UTF-8 storage size and round-trips it", () => {
  const value = { notes: "🐈 café 東京 ".repeat(1_200) };
  const encoded = encodeSyncValue(NAME, "data/notes", value);

  expect(encoded.chunkCount).toBeGreaterThan(1);
  for (const [key, storedValue] of Object.entries(encoded.updates)) {
    expect(syncItemBytes(key, storedValue)).toBeLessThan(8_192);
  }
  expect(decodeSyncStorage(encoded.updates, NAME).entries).toEqual([
    ["data/notes", value],
  ]);
});

test("does not combine chunks from different generations", () => {
  const first = encodeSyncValue(NAME, KEY, makeLargeValue("a"));
  const second = encodeSyncValue(NAME, KEY, makeLargeValue("b"));

  expect(first.chunkCount).toBe(second.chunkCount);
  expect(first.generation).not.toBe(second.generation);

  const mixed: Record<string, unknown> = {
    ...first.updates,
    [`${NAME}/${KEY}`]: second.updates[`${NAME}/${KEY}`],
  };
  const secondChunkKeys = syncChunkKeys(NAME, KEY, {
    chunkCount: second.chunkCount,
    generation: second.generation!,
  });
  mixed[secondChunkKeys[0]] = second.updates[secondChunkKeys[0]];

  const decoded = decodeSyncStorage(mixed, NAME);
  expect(decoded.entries).toEqual([]);
  expect(decoded.chunkSets.get(KEY)).toEqual({
    chunkCount: second.chunkCount,
    generation: second.generation,
  });
});

test("isolates an incomplete chunk set from unrelated sync values", () => {
  const encoded = encodeSyncValue(NAME, KEY, makeLargeValue());
  const stored: Record<string, unknown> = {
    ...encoded.updates,
    [`${NAME}/locale`]: "en-US",
  };
  const chunkKeys = syncChunkKeys(NAME, KEY, {
    chunkCount: encoded.chunkCount,
    generation: encoded.generation!,
  });
  delete stored[chunkKeys[0]];

  const decoded = decodeSyncStorage(stored, NAME);
  expect(decoded.entries).toEqual([["locale", "en-US"]]);
  expect(decoded.chunkSets.get(KEY)).toEqual({
    chunkCount: encoded.chunkCount,
    generation: encoded.generation,
  });
});

test("isolates invalid chunk JSON from unrelated sync values", () => {
  const encoded = encodeSyncValue(NAME, KEY, makeLargeValue());
  const stored: Record<string, unknown> = {
    ...encoded.updates,
    [`${NAME}/locale`]: "en-US",
  };
  const chunkKeys = syncChunkKeys(NAME, KEY, {
    chunkCount: encoded.chunkCount,
    generation: encoded.generation!,
  });
  stored[chunkKeys[0]] = "not-json";

  expect(decodeSyncStorage(stored, NAME).entries).toEqual([
    ["locale", "en-US"],
  ]);
});

test("rejects unbounded chunk counts without blocking unrelated sync values", () => {
  const stored = {
    [`${NAME}/${KEY}`]: {
      __tablissStorage: "tabliss-sync-chunks-v1",
      chunks: Number.MAX_SAFE_INTEGER,
      generation: "corrupt-generation",
    },
    [`${NAME}/locale`]: "en-US",
  };

  const decoded = decodeSyncStorage(stored, NAME);
  expect(decoded.entries).toEqual([["locale", "en-US"]]);
  expect(decoded.chunkSets.has(KEY)).toBe(false);
});

test("refuses to construct an unbounded chunk-key list", () => {
  expect(() =>
    syncChunkKeys(NAME, KEY, {
      chunkCount: Number.MAX_SAFE_INTEGER,
      generation: "corrupt-generation",
    }),
  ).toThrow(RangeError);
});

test("refuses to encode values requiring more than the safe chunk limit", () => {
  expect(() =>
    encodeSyncValue(NAME, "data/huge", { value: "x".repeat(300_000) }),
  ).toThrow("Sync-storage value requires too many chunks");
});

test("refuses a value that exceeds the total sync quota before the chunk limit", () => {
  expect(() =>
    encodeSyncValue(NAME, "data/huge", { value: "x".repeat(110_000) }),
  ).toThrow("Sync-storage value exceeds the total quota");
});

test("measures the complete encoded storage footprint", () => {
  const first = encodeSyncValue(NAME, KEY, makeLargeValue("a"));
  const second = encodeSyncValue(NAME, "data/other", makeLargeValue("b"));
  const stored = { ...first.updates, ...second.updates };

  expect(syncStorageBytes(stored)).toBeGreaterThan(0);
  expect(syncStorageBytes(stored)).toBeLessThan(SYNC_TOTAL_QUOTA_BYTES);
});

test("removes non-current generations for a rewritten key", () => {
  const first = encodeSyncValue(NAME, KEY, makeLargeValue("a"));
  const second = encodeSyncValue(NAME, KEY, makeLargeValue("b"));
  const stored = { ...first.updates, ...second.updates };

  expect(syncOrphanChunkDeletes(stored, NAME, [KEY]).sort()).toEqual(
    syncChunkKeys(NAME, KEY, {
      chunkCount: first.chunkCount,
      generation: first.generation!,
    }).sort(),
  );
});

test("removes old chunks when a chunked value becomes small", () => {
  const previous = { chunkCount: 3, generation: "previous-generation" };
  const encoded = encodeSyncValue(NAME, KEY, { links: [] }, previous);

  expect(encoded.chunkCount).toBe(0);
  expect(encoded.deletes).toEqual(syncChunkKeys(NAME, KEY, previous));
});

test("removes the manifest and all chunks when deleting a value", () => {
  const previous = { chunkCount: 2, generation: "previous-generation" };
  expect(syncChunkDeletes(NAME, KEY, previous)).toEqual([
    `${NAME}/${KEY}`,
    ...syncChunkKeys(NAME, KEY, previous),
  ]);
});

test("loads existing unchunked sync data unchanged", () => {
  const stored = {
    [`${NAME}/locale`]: "en-US",
    [`${NAME}/${KEY}`]: { links: [{ id: "existing" }] },
    "other-extension/value": "ignore me",
  };

  expect(decodeSyncStorage(stored, NAME).entries).toEqual([
    ["locale", "en-US"],
    [KEY, { links: [{ id: "existing" }] }],
  ]);
});
