import React from "react";
import { createRoot } from "react-dom/client";
import { capture } from "./errorHandler";
import { register as registerServiceWorker } from "./serviceWorker";
import { preloadBaseIcons } from "./utils";
import Root from "./views/Root";

// Capture uncaught errors globally
window.addEventListener("error", (event) =>
  capture(event.error ?? event.message),
);
window.addEventListener("unhandledrejection", (event) => capture(event.reason));

// Pre-cache common icons
preloadBaseIcons().catch(console.error);

// Render app into root element
createRoot(document.getElementById("root")!).render(<Root />);

// Register the service worker only for production web builds.
// Non-web targets handle service workers via their own manifests.
if (!DEV && BUILD_TARGET === "web") {
  registerServiceWorker();
}
