import type { Browser } from "webextension-polyfill";

import * as DB from "./db";
import { extension } from "./storage";
import * as Stream from "./stream";

const SYNC_ITEM_QUOTA = 8192;

class SyncStorage {
  private data: Record<string, unknown>;

  constructor(
    private readonly totalQuota = Number.POSITIVE_INFINITY,
    initial: Record<string, unknown> = {},
    private readonly beforeSet?: () => Promise<void>,
  ) {
    this.data = structuredClone(initial);
  }

  async get(): Promise<Record<string, unknown>> {
    return structuredClone(this.data);
  }

  async set(updates: Record<string, unknown>): Promise<void> {
    await this.beforeSet?.();
    for (const [key, value] of Object.entries(updates)) {
      const bytes =
        new TextEncoder().encode(key).byteLength +
        new TextEncoder().encode(JSON.stringify(value)).byteLength;
      if (bytes > SYNC_ITEM_QUOTA) {
        throw new Error("QuotaExceededError: item exceeds 8192 bytes");
      }
    }
    const next = { ...this.data, ...structuredClone(updates) };
    const totalBytes = Object.entries(next).reduce(
      (bytes, [key, value]) =>
        bytes +
        new TextEncoder().encode(key).byteLength +
        new TextEncoder().encode(JSON.stringify(value)).byteLength,
      0,
    );
    if (totalBytes > this.totalQuota) {
      throw new Error("QuotaExceededError: sync storage is full");
    }
    this.data = next;
  }

  async remove(keys: string | string[]): Promise<void> {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      delete this.data[key];
    }
  }
}

const setupExtensionStorage = (sync: SyncStorage) => {
  let flush: (() => void) | undefined;
  Object.defineProperty(globalThis, "browser", {
    configurable: true,
    value: { storage: { sync } } as unknown as Browser,
  });
  Object.defineProperty(globalThis, "DEV", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener: (event: string, listener: () => void) => {
        if (event === "beforeunload") flush = listener;
      },
    },
  });
  return () => {
    if (!flush) throw new Error("Storage flush listener was not registered");
    flush();
  };
};

const settle = async () => {
  for (let index = 0; index < 20; index += 1) {
    await Promise.resolve();
  }
};

test("sync storage round-trips a value larger than the per-item quota", async () => {
  const sync = new SyncStorage();
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));
  const value = { payload: "x".repeat(9000) };

  DB.put(source, "data/widget", value);
  flush();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toEqual([]);
  expect(DB.get(restored, "data/widget")).toEqual(value);
});

test("sync storage chunks escaped and multibyte content by stored bytes", async () => {
  const sync = new SyncStorage();
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));
  const value = { payload: '\\"😀'.repeat(3000) };

  DB.put(source, "data/widget", value);
  flush();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toEqual([]);
  expect(DB.get(restored, "data/widget")).toEqual(value);
});

test("sync storage removes obsolete chunks when a value becomes small", async () => {
  const sync = new SyncStorage(22_000);
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));

  DB.put(source, "data/first", { payload: "a".repeat(12_000) });
  flush();
  await settle();
  DB.put(source, "data/first", { payload: "small" });
  flush();
  await settle();
  DB.put(source, "data/second", { payload: "b".repeat(12_000) });
  flush();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toEqual([]);
  expect(DB.get(restored, "data/first")).toEqual({ payload: "small" });
  expect(DB.get(restored, "data/second")).toEqual({
    payload: "b".repeat(12_000),
  });
});

test("sync storage removes chunks when a value is deleted", async () => {
  const sync = new SyncStorage(14_000);
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));

  DB.put(source, "data/first", { payload: "a".repeat(10_000) });
  flush();
  await settle();
  DB.del(source, "data/first");
  flush();
  await settle();
  DB.put(source, "data/second", { payload: "b".repeat(10_000) });
  flush();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toEqual([]);
  expect(DB.get(restored, "data/first")).toBeUndefined();
  expect(DB.get(restored, "data/second")).toEqual({
    payload: "b".repeat(10_000),
  });
});

test("sync storage still reads existing unchunked values", async () => {
  const value = { enabled: true, links: ["one", "two"] };
  const sync = new SyncStorage(Number.POSITIVE_INFINITY, {
    "tabliss/config/data/widget": value,
  });
  setupExtensionStorage(sync);
  const restored = DB.init();

  await extension(restored, "tabliss/config", "sync");

  expect(DB.get(restored, "data/widget")).toEqual(value);
});

test("a value that cannot be chunked reports an error without blocking later saves", async () => {
  const sync = new SyncStorage();
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));

  DB.put(source, "x".repeat(SYNC_ITEM_QUOTA), { payload: "too large" });
  expect(flush).not.toThrow();
  await settle();
  DB.put(source, "data/widget", { payload: "saved" });
  flush();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toHaveLength(1);
  expect(DB.get(restored, "data/widget")).toEqual({ payload: "saved" });
});

test("overlapping batches save and clean up in order", async () => {
  let releaseFirstWrite!: () => void;
  const firstWrite = new Promise<void>((resolve) => {
    releaseFirstWrite = resolve;
  });
  let writes = 0;
  const sync = new SyncStorage(Number.POSITIVE_INFINITY, {}, () => {
    writes += 1;
    return writes === 1 ? firstWrite : Promise.resolve();
  });
  const flush = setupExtensionStorage(sync);
  const source = DB.init();
  const errors: Error[] = [];
  const errorStream = await extension(source, "tabliss/config", "sync");
  Stream.subscribe(errorStream, (error) => errors.push(error));

  DB.put(source, "data/widget", { payload: "a".repeat(10_000) });
  flush();
  await settle();
  DB.put(source, "data/widget", { payload: "new value" });
  flush();
  await settle();
  releaseFirstWrite();
  await settle();
  await settle();

  const restored = DB.init();
  await extension(restored, "tabliss/config", "sync");
  expect(errors).toEqual([]);
  expect(DB.get(restored, "data/widget")).toEqual({ payload: "new value" });
});

test.each([
  ["QuotaExceededError: sync storage is full", "storage quota is full"],
  [
    "MAX_WRITE_OPERATIONS_PER_MINUTE quota exceeded",
    "write-rate limit was exceeded",
  ],
  ["This is not a writable storage area", "storage area is read-only"],
  ["Extension context invalidated", "extension context is unavailable"],
])(
  "reports a specific storage failure for %s",
  async (browserMessage, detail) => {
    const sync = new SyncStorage(Number.POSITIVE_INFINITY, {}, () =>
      Promise.reject(new Error(browserMessage)),
    );
    const flush = setupExtensionStorage(sync);
    const source = DB.init();
    const errors: Error[] = [];
    const errorStream = await extension(source, "tabliss/config", "sync");
    Stream.subscribe(errorStream, (error) => errors.push(error));

    DB.put(source, "data/widget", { payload: "value" });
    flush();
    await settle();

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain(detail);
  },
);
