import { DB } from "./lib";

const sentry = {
  clients: 0,
  closed: 0,
  captured: [] as unknown[],
  options: undefined as Record<string, any> | undefined,
};

rstest.mock("@sentry/browser", () => ({
  BrowserClient: class {
    constructor(options: Record<string, any>) {
      sentry.clients += 1;
      sentry.options = options;
    }
    init() {}
    close() {
      sentry.closed += 1;
      return Promise.resolve(true);
    }
  },
  Scope: class {
    setClient() {}
    captureException(error: unknown) {
      sentry.captured.push(error);
    }
  },
  defaultStackParser: () => [],
  getDefaultIntegrations: () => [
    { name: "InboundFilters" },
    { name: "Breadcrumbs" },
    { name: "GlobalHandlers" },
    { name: "HttpContext" },
  ],
  makeFetchTransport: () => ({}),
}));

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// `db/state.ts` touches browser storage APIs on import, so it has to be mocked.
const setup = async (crashReportingEnabled: boolean) => {
  rstest.resetModules();
  const db = DB.init({ crashReportingEnabled });
  rstest.doMock("./db/state", () => ({
    db,
    dbStorage: Promise.resolve(null),
  }));
  const { initSentry } = await import("./sentry");
  const { capture } = await import("./errorHandler");
  initSentry();
  return { db, capture };
};

beforeEach(() => {
  sentry.clients = 0;
  sentry.closed = 0;
  sentry.captured = [];
  sentry.options = undefined;
  (globalThis as any).SENTRY_DSN = "https://key@o0.ingest.sentry.io/0";
  (globalThis as any).VERSION = "1.0.0";
  (globalThis as any).DEV = false;
  (globalThis as any).BUILD_TARGET = "web";
});

test("does nothing without a DSN", async () => {
  (globalThis as any).SENTRY_DSN = undefined;
  const { capture } = await setup(true);
  capture(new Error("boom"));
  await tick();
  expect(sentry.clients).toBe(0);
  expect(sentry.captured).toHaveLength(0);
});

test("reports errors once settings confirm reporting is enabled", async () => {
  const { capture } = await setup(true);

  // Captured before storage resolves — buffered, then flushed on load.
  capture(new Error("startup crash"));
  await tick();
  expect(sentry.clients).toBe(1);
  expect(sentry.captured).toHaveLength(1);

  capture(new Error("later crash"));
  expect(sentry.captured).toHaveLength(2);
});

test("reports nothing when the user has opted out", async () => {
  const { capture } = await setup(false);
  capture(new Error("boom"));
  await tick();

  // The client must never be created, so nothing can leave the browser.
  expect(sentry.clients).toBe(0);
  expect(sentry.captured).toHaveLength(0);
});

test("opting out closes the client and drops later errors", async () => {
  const { db, capture } = await setup(true);
  await tick();

  capture(new Error("first"));
  expect(sentry.captured).toHaveLength(1);

  DB.put(db, "crashReportingEnabled", false);
  capture(new Error("second"));
  await tick();
  expect(sentry.closed).toBe(1);
  expect(sentry.captured).toHaveLength(1);

  DB.put(db, "crashReportingEnabled", true);
  capture(new Error("third"));
  await tick();
  expect(sentry.clients).toBe(2);
  expect(sentry.captured).toHaveLength(2);
});

test("beforeSend strips personal data and honours opt-out", async () => {
  const { db } = await setup(true);
  await tick();

  const beforeSend = sentry.options!.beforeSend as (event: any) => any;
  const scrubbed = beforeSend({
    user: { ip_address: "1.2.3.4" },
    request: { url: "https://example.com/?secret=1", headers: {} },
    breadcrumbs: [{ message: "clicked" }],
    server_name: "host",
    extra: { debug: true },
    contexts: {
      browser: { name: "firefox" },
      culture: { locale: "en-AU", timezone: "Australia/Sydney" },
      trace: { trace_id: "abc" },
    },
  });

  expect(scrubbed.user).toBeUndefined();
  expect(scrubbed.request).toBeUndefined();
  expect(scrubbed.breadcrumbs).toBeUndefined();
  expect(scrubbed.server_name).toBeUndefined();
  expect(scrubbed.extra).toBeUndefined();
  expect(scrubbed.contexts.browser).toEqual({ name: "firefox" });
  expect(scrubbed.contexts.culture).toBeUndefined();
  expect(scrubbed.contexts.trace).toBeUndefined();

  DB.put(db, "crashReportingEnabled", false);
  expect(beforeSend({})).toBeNull();
});
