import browserApi from "webextension-polyfill";

import * as DB from "../../../src/lib/db/db";
import { extension } from "../../../src/lib/db/storage";
import * as Stream from "../../../src/lib/db/stream";

type Method = "set" | "remove" | "get";
type Fault = {
  method: Method;
  skip?: number;
  action: "fail" | "hold" | "fail-after";
};
const name = "stress/config";
const barrierKey = `__barrier/${crypto.randomUUID()}`;
const errors: string[] = [];
let fault: Fault | undefined;
let release: (() => void) | undefined;
let blocked = false;
let db = DB.init();
let area: "sync" | "local" = "sync";
const calls: { method: Method; keys: string[] }[] = [];
const storage = Object.fromEntries(
  (["sync", "local"] as const).map((storageArea) => [
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

export const harness = {
  errors,
  calls,
  get blocked() {
    return blocked;
  },
  async start(storageArea: "sync" | "local" = "sync") {
    area = storageArea;
    db = DB.init();
    try {
      Stream.subscribe(await extension(db, name, area), (error) =>
        errors.push(error.message),
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
    return Object.fromEntries(db);
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
      (await browserApi.storage[area].get(`${name}/${barrierKey}`))[
        `${name}/${barrierKey}`
      ] !== marker
    ) {
      if (Date.now() > deadline)
        throw new Error(`Save did not finish: ${errors.join("; ")}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    await navigator.locks.request(
      `tabliss-storage:${area}:${name}`,
      async () => {},
    );
  },
  raw() {
    return browserApi.storage[area].get();
  },
  seed(data: Record<string, unknown>) {
    return browserApi.storage[area].set(data);
  },
  remove(keys: string[]) {
    return browserApi.storage[area].remove(keys);
  },
};

declare global {
  interface Window {
    storageHarness: typeof harness;
  }
}
window.storageHarness = harness;
