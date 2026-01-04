import React from "react";
import { createRoot } from "react-dom/client";
import { register as registerServiceWorker } from "./serviceWorker";
import { preloadBaseIcons } from "./utils";
import Root from "./views/Root";

// Pre-cache common icons
preloadBaseIcons().catch(console.error);

// Render app into root element
createRoot(document.getElementById("root")!).render(<Root />);

if (!DEV) {
  registerServiceWorker();
}
