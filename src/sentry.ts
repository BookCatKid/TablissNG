import {
  BrowserClient,
  defaultStackParser,
  type ErrorEvent,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from "@sentry/browser";

import { db, dbStorage } from "./db/state";
import { type ErrorLogEntry, onError } from "./errorHandler";
import { DB } from "./lib";

// Manual BrowserClient + Scope instead of Sentry.init(): extension pages
// share global state with the host page, so init() could leak events between
// projects. Nothing is sent until the persisted opt-in is known, and
// beforeSend re-checks it for events already queued in the transport.

/** Max errors held while waiting for settings storage to load. */
const MAX_BUFFERED_ERRORS = 20;

/** Context keys that are safe to send — everything else is stripped. */
const CONTEXT_ALLOWLIST = new Set([
  "app",
  "browser",
  "device",
  "os",
  "runtime",
]);

let scope: Scope | null = null;
let client: BrowserClient | null = null;
let storageReady = false;
const buffer: ErrorLogEntry[] = [];

const reportingEnabled = (): boolean =>
  DB.get(db, "crashReportingEnabled") !== false;

const toError = (entry: ErrorLogEntry): Error => {
  if (entry.raw instanceof Error) return entry.raw;
  const error = new Error(entry.message);
  if (entry.stack) error.stack = entry.stack;
  return error;
};

const scrub = (event: ErrorEvent): ErrorEvent => {
  delete event.user;
  delete event.request;
  delete event.breadcrumbs;
  delete event.server_name;
  delete event.extra;
  if (event.contexts) {
    for (const key of Object.keys(event.contexts)) {
      if (!CONTEXT_ALLOWLIST.has(key)) delete event.contexts[key];
    }
  }
  return event;
};

const createScope = (): Scope => {
  // Drop integrations that touch global state or attach headers, URLs,
  // locale and timezone.
  const integrations = getDefaultIntegrations({}).filter(
    (integration) =>
      ![
        "BrowserApiErrors",
        "BrowserSession",
        "Breadcrumbs",
        "ConversationId",
        "CultureContext",
        "FunctionToString",
        "GlobalHandlers",
        "HttpContext",
      ].includes(integration.name),
  );

  client = new BrowserClient({
    dsn: SENTRY_DSN,
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations,
    release: `tablissng@${VERSION}`,
    environment: DEV ? "development" : "production",
    dist: BUILD_TARGET,
    sendDefaultPii: false,
    sendClientReports: false,
    attachStacktrace: true,
    // Hostnames of failed fetches may be user-configured endpoints.
    enhanceFetchErrorMessages: false,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      // Local variables and source snippets may contain user data.
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeSend: (event) => {
      // Opt-out must apply even to events already queued in the transport.
      if (!reportingEnabled()) return null;
      return scrub(event);
    },
  });

  const scope = new Scope();
  scope.setClient(client);
  client.init();
  return scope;
};

const syncClient = (): void => {
  if (reportingEnabled() && !scope) {
    scope = createScope();
    for (const entry of buffer.splice(0)) {
      scope.captureException(toError(entry));
    }
  } else if (!reportingEnabled() && scope) {
    buffer.length = 0;
    void client?.close();
    client = null;
    scope = null;
  }
};

/** Start reporting errors once settings storage confirms the user opted in. */
export const initSentry = (): void => {
  if (!SENTRY_DSN || DEV) return;

  onError((entry) => {
    if (scope) {
      scope.captureException(toError(entry));
    } else if (!storageReady && buffer.length < MAX_BUFFERED_ERRORS) {
      // Hold errors until the persisted preference is known.
      buffer.push(entry);
    }
  });

  dbStorage.then(
    () => {
      storageReady = true;
      syncClient();
      DB.listen(db, ([key]) => {
        if (key === "crashReportingEnabled") syncClient();
      });
    },
    () => {
      // Settings storage failed to open — report nothing this session.
    },
  );
};
