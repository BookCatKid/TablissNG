import "normalize.css";
import "./styles.sass";

import { createRoot } from "react-dom/client";

import { capture } from "./errorHandler";
import { initSentry } from "./sentry";
import { register as registerServiceWorker } from "./serviceWorker";
import Root from "./views/Root";

// Capture uncaught errors globally
window.addEventListener("error", (event) =>
  capture(event.error ?? event.message),
);
window.addEventListener("unhandledrejection", (event) => capture(event.reason));

initSentry();

// React 19 reports uncaught and recoverable errors through these callbacks
// instead of window.onerror.
createRoot(document.getElementById("root")!, {
  onRecoverableError: (error) => capture(error),
  onUncaughtError: (error) => capture(error),
}).render(<Root />);

// Register the service worker only for production web builds.
// Non-web targets handle service workers via their own manifests.
if (!DEV && BUILD_TARGET === "web") {
  registerServiceWorker();
}
