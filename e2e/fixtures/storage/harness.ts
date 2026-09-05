import browserApi from "webextension-polyfill";

import * as DB from "../../../src/lib/db/db";
import { extension, indexeddb } from "../../../src/lib/db/storage";
import * as Stream from "../../../src/lib/db/stream";

type Method = "set" | "remove" | "get";
type Fault = {
  method: Method;
  skip?: number;
  action: "fail" | "hold" | "fail-after";
};
export type StorageBackend = "sync" | "local" | "managed" | "indexeddb";
let name = "stress/config";
const barrierKey = `__barrier/${crypto.randomUUID()}`;
const errors: string[] = [];
let fault: Fault | undefined;
let release: (() => void) | undefined;
let blocked = false;
let db = DB.init();
let area: StorageBackend = "sync";
const calls: { method: Method; keys: string[] }[] = [];
const storage = Object.fromEntries(
  (["sync", "local", "managed"] as const).map((storageArea) => [
    storageArea,
    Object.fromEntries(
      (["get", "set", "remove"] as const).map((method) => [
        method,
        async (arg: never) => {
          calls.push({
            method,
            keys:
              typeof arg === "string"
                ? [arg]
                : Array.isArray(arg)
                  ? arg
                  : Object.keys(arg ?? {}),
          });
          let failAfter = false;
          if (fault?.method === method) {
            if (fault.skip) fault.skip -= 1;
            else {
              const action = fault.action;
              fault = undefined;
              if (action === "fail")
                throw new Error(`Injected ${method} failure`);
              if (action === "fail-after") failAfter = true;
              else {
                blocked = true;
                await new Promise<void>((resolve) => {
                  release = resolve;
                });
                blocked = false;
              }
            }
          }
          // All successful operations hit the real Chrome storage backend.
          const result = await browserApi.storage[storageArea][method](arg);
          if (failAfter)
            throw new Error(`Injected ${method} acknowledgement failure`);
          return result;
        },
      ]),
    ),
  ]),
);
Object.defineProperty(globalThis, "browser", { value: { storage } });

// Read/write the browser's physical IndexedDB store independently of the
// production adapter, so persistence assertions cannot pass on in-memory state.
const idbStorage = (
  updates?: Record<string, unknown>,
): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    const open = indexedDB.open(name, 1);
    open.onerror = () => reject(open.error);
    open.onupgradeneeded = () => open.result.createObjectStore("changes");
    open.onsuccess = () => {
      const conn = open.result;
      const trx = conn.transaction(
        "changes",
        updates ? "readwrite" : "readonly",
      );
      const store = trx.objectStore("changes");
      if (updates) {
        for (const [key, value] of Object.entries(updates))
          store.put(value, key);
      }
      const keys = store.getAllKeys();
      const values = store.getAll();
      trx.oncomplete = () => {
        conn.close();
        resolve(
          Object.fromEntries(
            keys.result.map((key, i) => [String(key), values.result[i]]),
          ),
        );
      };
      trx.onabort = () => {
        conn.close();
        reject(trx.error);
      };
    };
  });

export const harness = {
  errors,
  calls,
  get blocked() {
    return blocked;
  },
  async start(
    storageArea: StorageBackend = "sync",
    storageName = "stress/config",
    defaults?: Record<string, unknown>,
  ) {
    area = storageArea;
    name = storageName;
    db = DB.init(defaults);
    try {
      Stream.subscribe(
        await (area === "indexeddb"
          ? indexeddb(db, name)
          : extension(db, name, area)),
        (error) => errors.push(error.message),
      );
      return true;
    } catch (error) {
      errors.push(String(error));
      return false;
    }
  },
  fault(next: Fault) {
    fault = next;
  },
  release() {
    release?.();
  },
  put(key: string, value: unknown) {
    DB.put(db, key, value);
  },
  del(key: string) {
    DB.del(db, key);
  },
  values() {
    return Object.fromEntries(DB.prefix(db, ""));
  },
  flush() {
    window.dispatchEvent(new Event("beforeunload"));
  },
  async drain() {
    // A separate trailing batch still completes when the preceding save fails.
    this.flush();
    const marker = crypto.randomUUID();
    DB.put(db, barrierKey, marker);
    this.flush();
    const deadline = Date.now() + 10_000;
    while (
      (await this.raw())[
        area === "indexeddb" ? barrierKey : `${name}/${barrierKey}`
      ] !== marker
    ) {
      if (Date.now() > deadline)
        throw new Error(`Save did not finish: ${errors.join("; ")}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    if (area !== "indexeddb") {
      await navigator.locks.request(
        `tabliss-storage:${area}:${name}`,
        async () => {},
      );
    }
  },
  raw() {
    return area === "indexeddb" ? idbStorage() : browserApi.storage[area].get();
  },
  seed(data: Record<string, unknown>) {
    return area === "indexeddb"
      ? idbStorage(data).then(() => {})
      : browserApi.storage[area].set(data);
  },
  remove(keys: string[]) {
    if (area === "indexeddb") throw new Error("Use del() for IndexedDB tests");
    return browserApi.storage[area].remove(keys);
  },
};

declare global {
  interface Window {
    storageHarness: typeof harness;
  }
}
window.storageHarness = harness;
