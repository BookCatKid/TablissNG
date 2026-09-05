import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { rspack } from "@rspack/core";

import type {} from "./fixtures/storage/harness";

let extensionPath: string;
let context: BrowserContext;
let page: Page;
let profilePath: string;
const storageKey = "stress/config/value";

test.beforeAll(async () => {
  extensionPath = await mkdtemp(
    path.join(tmpdir(), "tabliss-storage-extension-"),
  );
  await writeFile(
    path.join(extensionPath, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "Tabliss storage integrity tests",
      version: "1.0",
      permissions: ["storage"],
      chrome_url_overrides: { newtab: "index.html" },
    }),
  );
  await writeFile(
    path.join(extensionPath, "index.html"),
    '<!doctype html><title>Storage integrity harness</title><script src="harness.js"></script>',
  );
  await new Promise<void>((resolve, reject) => {
    const compiler = rspack({
      mode: "development",
      devtool: false,
      entry: path.resolve("e2e/fixtures/storage/harness.ts"),
      output: { path: extensionPath, filename: "harness.js" },
      resolve: { extensions: [".ts", ".js"] },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [
              {
                loader: "builtin:swc-loader",
                options: {
                  jsc: { parser: { syntax: "typescript" }, target: "es2022" },
                },
              },
            ],
          },
        ],
      },
      plugins: [new rspack.DefinePlugin({ DEV: "false" })],
    });
    compiler.run((error, stats) => {
      compiler.close(() => {
        if (error || stats?.hasErrors())
          reject(error ?? new Error(stats?.toString()));
        else resolve();
      });
    });
  });
});

test.afterAll(async () => {
  if (extensionPath) await rm(extensionPath, { recursive: true, force: true });
});
test.beforeEach(async () => {
  profilePath = await mkdtemp(path.join(tmpdir(), "tabliss-storage-profile-"));
  context = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  page = context.pages()[0] ?? (await context.newPage());
  await page.goto("chrome://newtab");
  await page.waitForFunction(() => !!window.storageHarness);
});
test.afterEach(async () => {
  await context?.close();
  if (profilePath) await rm(profilePath, { recursive: true, force: true });
});

async function start(target = page, area: "sync" | "local" = "sync") {
  expect(
    await target.evaluate((area) => window.storageHarness.start(area), area),
  ).toBe(true);
}
async function save(value: unknown, target = page, key = "value") {
  await target.evaluate(
    async ({ serialized, key }) => {
      window.storageHarness.put(key, JSON.parse(serialized));
      await window.storageHarness.drain();
    },
    { serialized: JSON.stringify(value), key },
  );
}
async function reload(target = page) {
  await target.reload();
  await target.waitForFunction(() => !!window.storageHarness);
  await start(target);
  return JSON.parse(
    await target.evaluate(() => JSON.stringify(window.storageHarness.values())),
  );
}
async function assertPhysicalIntegrity(target = page) {
  const raw = await target.evaluate(() => window.storageHarness.raw());
  const referenced = new Set<string>();
  for (const [key, value] of Object.entries(raw)) {
    expect(
      Buffer.byteLength(key) + Buffer.byteLength(JSON.stringify(value)),
      key,
    ).toBeLessThanOrEqual(8192);
    if (
      key.startsWith("stress/config/") &&
      value &&
      typeof value === "object" &&
      "__tablissChunks" in value
    ) {
      for (const chunk of (value as { __tablissChunks: string[] })
        .__tablissChunks) {
        expect(typeof raw[chunk], chunk).toBe("string");
        referenced.add(chunk);
      }
    }
  }
  expect(
    Object.keys(raw)
      .filter((key) => key.startsWith("/$tablissChunks/"))
      .sort(),
  ).toEqual([...referenced].sort());
  return raw;
}

for (const [label, unit] of Object.entries({
  ascii: "a",
  unicode: "😀漢é",
  escapes: '\\"\n\t\u0000',
  surrogates: "\ud800x\udfff",
  mixed: "👨‍👩‍👧‍👦é\\漢",
})) {
  test(`stress: ${label} exact round trips, growth, shrinkage and deletion`, async () => {
    await start();
    for (let round = 0; round < 12; round += 1) {
      const value = {
        round,
        payload: unit.repeat(round % 3 === 0 ? 1 : 900 + round * 20),
        nested: [null, false, 0, [unit]],
      };
      await save(value);
      await assertPhysicalIntegrity();
      expect((await reload()).value).toEqual(value);
    }
    await page.evaluate(async () => {
      window.storageHarness.del("value");
      await window.storageHarness.drain();
    });
    expect((await reload()).value).toBeUndefined();
    await assertPhysicalIntegrity();
  });
}

test("exact per-item boundaries and reserved-looking user keys survive reload", async () => {
  await start();
  // JSON quotes and the physical key count towards Chrome's per-item quota.
  for (const delta of [-1, 0, 1]) {
    const value = "x".repeat(8192 - Buffer.byteLength(storageKey) - 2 + delta);
    await save(value);
    const raw = await assertPhysicalIntegrity();
    expect(typeof raw[storageKey]).toBe(delta > 0 ? "object" : "string");
    expect((await reload()).value).toEqual(value);
  }
  const keys = [
    "value/$chunks/0",
    "x/$chunks/not-an-index",
    "__proto__",
    "constructor",
    "雪/😀",
    "/$tablissChunks/fake/0",
  ];
  for (const key of keys)
    await save({ key, payload: "z".repeat(9000) }, page, key);
  const restored = await reload();
  for (const key of keys)
    expect(restored[key]).toEqual({ key, payload: "z".repeat(9000) });
  await assertPhysicalIntegrity();
});

test("thousands of edits coalesce without losing the final state of any key", async () => {
  await start();
  const expected = await page.evaluate(async () => {
    const expected: Record<string, unknown> = {};
    for (let i = 0; i < 5000; i += 1) {
      const key = `key-${i % 8}`;
      const value = {
        revision: i,
        payload: "😀\\".repeat(i % 8 === 0 ? 1500 : 20),
      };
      window.storageHarness.put(key, value);
      expected[key] = value;
      if (i % 19 === 0) {
        window.storageHarness.del(key);
        delete expected[key];
      }
    }
    await window.storageHarness.drain();
    return expected;
  });
  const restored = await reload();
  for (const key of Object.keys(restored)) {
    if (key.startsWith("__barrier/")) delete restored[key];
  }
  expect(restored).toEqual(expected);
  await assertPhysicalIntegrity();
});

test("concurrent tabs serialize generation changes and never mix payloads", async () => {
  await start();
  await save({ writer: "initial", payload: "0".repeat(9000) });
  const other = await context.newPage();
  await other.goto(page.url());
  await start(other);
  for (let round = 0; round < 10; round += 1) {
    const a = { writer: "A", round, payload: "a".repeat(9000 + round) };
    const b = { writer: "B", round, payload: "😀".repeat(2300 + round) };
    await Promise.all([save(a), save(b, other)]);
    const reader = await context.newPage();
    await reader.goto(page.url());
    await start(reader);
    const value = await reader.evaluate(
      () => window.storageHarness.values().value,
    );
    expect([a, b]).toContainEqual(value);
    await reader.close();
    await assertPhysicalIntegrity();
  }
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([]);
  expect(await other.evaluate(() => window.storageHarness.errors)).toEqual([]);
});

for (const skip of [0, 1]) {
  test(`failed ${skip ? "manifest publication" : "chunk staging"} preserves the previous committed value`, async () => {
    await start();
    const previous = { payload: "old".repeat(3500) };
    await save(previous);
    await page.evaluate(
      (skip) =>
        window.storageHarness.fault({ method: "set", skip, action: "fail" }),
      skip,
    );
    await save({ payload: "new".repeat(4000) });
    expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([
      expect.stringContaining("Injected set failure"),
    ]);
    await assertPhysicalIntegrity();
    expect((await reload()).value).toEqual(previous);
    const recovered = { payload: "recovered".repeat(1500) };
    await save(recovered);
    expect((await reload()).value).toEqual(recovered);
  });
}

test("failed obsolete-chunk cleanup is retried on the next save", async () => {
  await start();
  await save("x".repeat(18000));
  await page.evaluate(() =>
    window.storageHarness.fault({ method: "remove", action: "fail" }),
  );
  await page.evaluate(() => {
    window.storageHarness.put("value", "small");
    window.storageHarness.flush();
  });
  await expect
    .poll(() => page.evaluate(() => window.storageHarness.errors.length))
    .toBe(1);
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([
    expect.stringContaining("Injected remove failure"),
  ]);
  expect(
    Object.keys(await page.evaluate(() => window.storageHarness.raw())).some(
      (key) => key.startsWith("/$tablissChunks/"),
    ),
  ).toBe(true);
  await save("next");
  await assertPhysicalIntegrity();
  expect((await reload()).value).toBe("next");
});

test("failed logical deletion keeps the manifest and all its chunks", async () => {
  await start();
  const value = "x".repeat(16000);
  await save(value);
  await page.evaluate(async () => {
    window.storageHarness.fault({ method: "remove", action: "fail" });
    window.storageHarness.del("value");
    await window.storageHarness.drain();
  });
  await assertPhysicalIntegrity();
  expect((await reload()).value).toEqual(value);
});

test("real Chrome total-quota rejection leaves the previous value intact", async () => {
  await start();
  const previous = "x".repeat(45000);
  await save(previous);
  await save("y".repeat(65000));
  expect(
    (await page.evaluate(() => window.storageHarness.errors)).join(),
  ).toMatch(/quota/i);
  await assertPhysicalIntegrity();
  expect((await reload()).value).toEqual(previous);
});

for (const corruption of [
  "missing",
  "non-string",
  "valid-json-modification",
  "foreign-reference",
  "duplicate",
  "reordered",
  "empty",
  "invalid-list",
  "invalid-entry",
  "wrong-version",
  "missing-digest",
] as const) {
  test(`rejects ${corruption} chunks, loads healthy keys, and preserves raw recovery data`, async () => {
    await start();
    await save({ payload: "a".repeat(18000) });
    await save({ healthy: true }, page, "unrelated");
    await page.evaluate(async (corruption) => {
      const h = window.storageHarness;
      const raw = await h.raw();
      const key = "stress/config/value";
      const manifest = raw[key] as { __tablissChunks: string[] };
      const chunks = manifest.__tablissChunks;
      if (corruption === "missing") await h.remove([chunks[1]]);
      if (corruption === "non-string") await h.seed({ [chunks[1]]: 42 });
      if (corruption === "valid-json-modification")
        await h.seed({
          [chunks[1]]: (raw[chunks[1]] as string).replace("a", "b"),
        });
      if (corruption === "foreign-reference")
        chunks[0] = "stress/config/unrelated";
      if (corruption === "duplicate") chunks[1] = chunks[0];
      if (corruption === "reordered") chunks.reverse();
      if (corruption === "empty") chunks.length = 0;
      const malformed = manifest as unknown as Record<string, unknown>;
      if (corruption === "invalid-list")
        malformed.__tablissChunks = "not an array";
      if (corruption === "invalid-entry") malformed.__tablissChunks = [123];
      if (corruption === "wrong-version") malformed.version = 99;
      if (corruption === "missing-digest") delete malformed.digest;
      await h.seed({ [key]: manifest });
    }, corruption);
    const damaged = await page.evaluate(() => window.storageHarness.raw());
    await page.reload();
    expect(await page.evaluate(() => window.storageHarness.start())).toBe(
      false,
    );
    expect(
      await page.evaluate(() => window.storageHarness.values().unrelated),
    ).toEqual({ healthy: true });
    expect(
      await page.evaluate(() => window.storageHarness.values().value),
    ).toBeUndefined();
    await page.evaluate(() => {
      window.storageHarness.put("value", "default-must-not-overwrite");
      window.storageHarness.flush();
    });
    expect(await page.evaluate(() => window.storageHarness.raw())).toEqual(
      damaged,
    );
    expect(
      await page.evaluate(() => window.storageHarness.errors),
    ).toHaveLength(1);
  });
}

test("local storage keeps manifest-shaped objects and chunk-looking keys verbatim", async () => {
  await start(page, "local");
  const value = { __tablissChunks: ["missing"] };
  await save(value, page, "x/$chunks/0");
  await page.reload();
  await start(page, "local");
  expect(
    await page.evaluate(() => window.storageHarness.values()["x/$chunks/0"]),
  ).toEqual(value);
});

test("sync round-trips ordinary manifest-shaped data without interpreting it twice", async () => {
  await start();
  const value = { __tablissChunks: ["ordinary user data"] };
  await save(value);
  expect((await reload()).value).toEqual(value);
});

test("reads and upgrades legacy chunks without dropping unrelated chunk-looking keys", async () => {
  const value = { legacy: true, payload: "x".repeat(9000) };
  await page.evaluate(async (value) => {
    const serialized = JSON.stringify(value);
    await window.storageHarness.seed({
      "stress/config/value": {
        __tablissChunks: [
          "stress/config/value/$chunks/0",
          "stress/config/value/$chunks/1",
        ],
      },
      "stress/config/value/$chunks/0": serialized.slice(0, 5000),
      "stress/config/value/$chunks/1": serialized.slice(5000),
      "stress/config/user/$chunks/0": "legitimate",
    });
  }, value);
  await start();
  expect(
    await page.evaluate(() => window.storageHarness.values().value),
  ).toEqual(value);
  expect(
    await page.evaluate(() => window.storageHarness.values()["user/$chunks/0"]),
  ).toBe("legitimate");
  await save({ upgraded: true, payload: "y".repeat(10000) });
  const raw = await assertPhysicalIntegrity();
  expect(raw["stress/config/value/$chunks/0"]).toBeUndefined();
  expect((await reload())["user/$chunks/0"]).toBe("legitimate");
});

for (const skip of [0, 1]) {
  test(`closing a writer during ${skip ? "manifest publication" : "chunk staging"} preserves its prior commit`, async () => {
    await start();
    const previous = { payload: "old".repeat(3500) };
    await save(previous);
    const url = page.url();
    await page.evaluate((skip) => {
      window.storageHarness.fault({ method: "set", skip, action: "hold" });
      window.storageHarness.put("value", { payload: "new".repeat(4000) });
      window.storageHarness.flush();
    }, skip);
    await page.waitForFunction(() => window.storageHarness.blocked);
    await page.close();
    page = await context.newPage();
    await page.goto(url);
    await start();
    expect(
      await page.evaluate(() => window.storageHarness.values().value),
    ).toEqual(previous);
    // A killed staging writer can leave unreachable chunks; never delete a
    // generation merely because a remote manifest has not arrived yet.
    expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([]);
  });
}

for (const seed of [1, 42, 183, 8192, 0xdeadbeef]) {
  test(`seed ${seed}: 5000 model-based mixed edits match an independent map after every restart`, async () => {
    await start();
    let state = seed >>> 0;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state;
    };
    const expected = new Map<string, unknown>();
    for (let round = 0; round < 10; round += 1) {
      const changes: { key: string; value?: unknown; deleted: boolean }[] = [];
      for (let i = 0; i < 500; i += 1) {
        const key = `model/${random() % 5}`;
        const deleted = random() % 7 === 0;
        const value = {
          round,
          revision: i,
          seed,
          payload: ["x", "😀", '\\"\n', "漢é"][random() % 4].repeat(
            random() % 2200,
          ),
          nested: [null, false, random(), { key }],
        };
        changes.push({ key, value, deleted });
        if (deleted) expected.delete(key);
        else expected.set(key, value);
      }
      await page.evaluate(async (changes) => {
        for (const { key, value, deleted } of changes) {
          if (deleted) window.storageHarness.del(key);
          else window.storageHarness.put(key, value);
        }
        await window.storageHarness.drain();
      }, changes);
      expect(await page.evaluate(() => window.storageHarness.errors)).toEqual(
        [],
      );
      const restored = await reload();
      for (const key of Object.keys(restored))
        if (key.startsWith("__barrier/")) delete restored[key];
      expect(restored).toEqual(Object.fromEntries(expected));
      await assertPhysicalIntegrity();
    }
  });
}

test("a delayed write cannot overtake later growth, shrinkage, deletion and recreation", async () => {
  await start();
  await page.evaluate(() => {
    window.storageHarness.fault({ method: "set", action: "hold" });
    window.storageHarness.put("value", "a".repeat(16000));
    window.storageHarness.flush();
  });
  await page.waitForFunction(() => window.storageHarness.blocked);
  await page.evaluate(() => {
    const h = window.storageHarness;
    h.put("value", "b".repeat(20000));
    h.flush();
    h.put("value", "small");
    h.flush();
    h.del("value");
    h.flush();
    h.put("value", { final: "😀".repeat(3000) });
    h.flush();
    h.release();
  });
  await page.evaluate(() => window.storageHarness.drain());
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([]);
  expect((await reload()).value).toEqual({ final: "😀".repeat(3000) });
  await assertPhysicalIntegrity();
});

test("hundreds of distinct keys stay batched below Chrome's write-operation quota", async () => {
  await start();
  await page.evaluate(async () => {
    for (let i = 0; i < 400; i += 1)
      window.storageHarness.put(`small/${i}`, { i });
    await window.storageHarness.drain();
  });
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        window.storageHarness.calls.filter((call) => call.method === "set")
          .length,
    ),
  ).toBe(2);
  const restored = await reload();
  for (let i = 0; i < 400; i += 1)
    expect(restored[`small/${i}`]).toEqual({ i });
  await assertPhysicalIntegrity();
});

test("real Chrome MAX_ITEMS exhaustion preserves the last committed generation", async () => {
  await start();
  const previous = "x".repeat(9000);
  await save(previous);
  await page.evaluate(async () => {
    await window.storageHarness.seed(
      Object.fromEntries(Array.from({ length: 507 }, (_, i) => [`f${i}`, 0])),
    );
  });
  await save("y".repeat(17000));
  expect(
    (await page.evaluate(() => window.storageHarness.errors)).join(),
  ).toMatch(/MAX_?ITEMS/i);
  expect((await reload()).value).toBe(previous);
  await assertPhysicalIntegrity();
});

test("real Chrome write-rate exhaustion reports failure and preserves committed data", async () => {
  await start();
  const previous = "x".repeat(9000);
  await save(previous);
  await page.evaluate(async () => {
    for (let i = 0; i < 130; i += 1) {
      try {
        await window.storageHarness.seed({ rate: i });
      } catch {
        break;
      }
    }
    window.storageHarness.put("value", "y".repeat(12000));
    window.storageHarness.flush();
  });
  await expect
    .poll(() => page.evaluate(() => window.storageHarness.errors.join()))
    .toMatch(/MAX_WRITE_OPERATIONS_PER_MINUTE/);
  expect((await reload()).value).toBe(previous);
  await assertPhysicalIntegrity();
});

test("a remote manifest arriving before its chunks fails safely and recovers when they arrive", async () => {
  await start();
  const value = { remote: true, payload: "漢".repeat(7000) };
  await save(value);
  const chunks = await page.evaluate(async () => {
    const raw = await window.storageHarness.raw();
    const chunks = Object.fromEntries(
      Object.entries(raw).filter(([key]) => key.startsWith("/$tablissChunks/")),
    );
    await window.storageHarness.remove(Object.keys(chunks));
    return chunks;
  });
  await page.reload();
  expect(await page.evaluate(() => window.storageHarness.start())).toBe(false);
  await page.evaluate((chunks) => window.storageHarness.seed(chunks), chunks);
  expect((await reload()).value).toEqual(value);
  await assertPhysicalIntegrity();
});

test("malformed JSON in legacy chunks never becomes a default persisted over the original", async () => {
  await page.evaluate(() =>
    window.storageHarness.seed({
      "stress/config/value": {
        __tablissChunks: ["stress/config/value/$chunks/0"],
      },
      "stress/config/value/$chunks/0": '{"truncated":',
      "stress/config/healthy": 123,
    }),
  );
  const raw = await page.evaluate(() => window.storageHarness.raw());
  expect(await page.evaluate(() => window.storageHarness.start())).toBe(false);
  expect(
    await page.evaluate(() => window.storageHarness.values().healthy),
  ).toBe(123);
  expect(await page.evaluate(() => window.storageHarness.raw())).toEqual(raw);
});

test("unsupported oversized keys fail preparation without blocking valid sibling changes", async () => {
  await start();
  await page.evaluate(async () => {
    window.storageHarness.put("x".repeat(8192), "too large");
    window.storageHarness.put("healthy", { saved: true });
    await window.storageHarness.drain();
  });
  expect(await page.evaluate(() => window.storageHarness.errors)).toHaveLength(
    1,
  );
  expect((await reload()).healthy).toEqual({ saved: true });
  await assertPhysicalIntegrity();
});

test("a multi-megabyte value fails safely before staging any chunks", async () => {
  await start();
  await save({ durable: true });
  const previousCalls = await page.evaluate(
    () =>
      window.storageHarness.calls.filter((call) => call.method === "set")
        .length,
  );
  await save("😀".repeat(500_000));
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([
    expect.stringContaining("exceeds total sync storage quota"),
  ]);
  // Only the test's trailing completion marker was written.
  expect(
    await page.evaluate(
      () =>
        window.storageHarness.calls.filter((call) => call.method === "set")
          .length,
    ),
  ).toBe(previousCalls + 1);
  expect((await reload()).value).toEqual({ durable: true });
  await assertPhysicalIntegrity();
});

for (const skip of [0, 1]) {
  test(`lost acknowledgement after ${skip ? "publication" : "staging"} never deletes a referenced payload`, async () => {
    await start();
    const previous = { payload: "old".repeat(3000) };
    const next = { payload: "new".repeat(4000) };
    await save(previous);
    await page.evaluate(
      (skip) =>
        window.storageHarness.fault({
          method: "set",
          skip,
          action: "fail-after",
        }),
      skip,
    );
    await save(next);
    expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([
      expect.stringContaining("acknowledgement failure"),
    ]);
    await assertPhysicalIntegrity();
    expect((await reload()).value).toEqual(skip ? next : previous);
    await save({ recovered: true });
    expect((await reload()).value).toEqual({ recovered: true });
  });
}

test("a damaged manifest arriving after startup cannot be overwritten by a later save", async () => {
  await start();
  const damaged = { __tablissChunks: ["foreign/recoverable/data"] };
  await page.evaluate(
    (damaged) => window.storageHarness.seed({ "stress/config/value": damaged }),
    damaged,
  );
  await page.evaluate(async () => {
    window.storageHarness.put("value", {
      default: "must not destroy recovery data",
    });
    window.storageHarness.put("healthy", 42);
    await window.storageHarness.drain();
  });
  const raw = await page.evaluate(() => window.storageHarness.raw());
  expect(raw["stress/config/value"]).toEqual(damaged);
  expect(raw["stress/config/healthy"]).toBe(42);
  expect(await page.evaluate(() => window.storageHarness.errors)).toEqual([
    expect.stringContaining("Invalid chunk manifest"),
  ]);
});
