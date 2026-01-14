import React from "react";
import { defineMessages, useIntl } from "react-intl";
import { usePushError } from "../api";
import { UiContext } from "../contexts/ui";
import { migrate } from "../db/migrate";
import { cacheStorage, dbStorage } from "../db/state";
import { Stream } from "../lib";
import { useValue } from "../lib/db/react";
import Dashboard from "./dashboard";
import { Settings } from "./settings";
import Errors from "./shared/Errors";
import StoreError from "./shared/StoreError";
import { db } from "../db/state";
import { useSystemTheme, useFavicon } from "../hooks";

function setHighlighting() {
  const checked = db.cache.get("highlightingEnabled");
  const element = document.querySelector(".Widgets") as HTMLElement;
  if (element) {
    if (checked || checked === undefined) {
      element.style.userSelect = "auto";
    } else {
      element.style.userSelect = "none";
    }
  }
}

const messages = defineMessages({
  pageTitle: {
    id: "app.pageTitle",
    description: "Page title that Tabliss displays in the title bar.",
    defaultMessage: "New Tab",
  },
});

const Root: React.FC = () => {
  // Set page title
  const intl = useIntl();
  React.useEffect(() => {
    document.title = intl.formatMessage(messages.pageTitle);
  }, [intl]);

  // Wait for storage to be ready before displaying
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(false);
  const themePreference = useValue(db, "themePreference");
  const systemIsDark = useSystemTheme();

  React.useEffect(() => {
    const isDark =
      themePreference === "system" ? systemIsDark : themePreference === "dark";
    document.body.className = isDark ? "dark" : "";
  }, [themePreference, systemIsDark]);

  useFavicon();

  const pushError = usePushError();
  const handleError =
    (message: string, showError: boolean) => (error: Error) => {
      pushError({ message });
      console.error(error);
      console.error("Caused by:", error.cause);
      if (showError) setError(true);
    };

  React.useEffect(() => {
    const subscriptions = Promise.all([
      // Config database
      dbStorage
        .then((errors) =>
          Stream.subscribe(
            errors,
            handleError(
              "Cannot save your settings. You may have hit the maximum storage capacity.",
              true,
            ),
          ),
        )
        .catch(
          handleError(
            "Cannot open settings storage. Your settings cannot be loaded or saved.",
            true,
          ),
        ),
      // Cache database
      cacheStorage
        .then((errors) =>
          Stream.subscribe(
            errors,
            handleError(
              "Cannot save cache. Start up performance may be degraded.",
              false,
            ),
          ),
        )
        .catch(
          handleError(
            "Cannot open cache. Start up performance may be degraded.",
            false,
          ),
        ),
    ]);

    // Storage is ready
    subscriptions.then(() => {
      setReady(true);
      migrate();
      setTimeout(() => {
        setHighlighting();
      }, 1);
    });

    return () => {
      // Remove error subscriptions
      subscriptions.then(([dbSub, cacheSub]) => {
        if (dbSub) dbSub();
        if (cacheSub) cacheSub();
      });
    };
  }, []);

  const { errors, settings, toggleErrors } = React.use(UiContext);

  return (
    <>
      {ready ? <Dashboard /> : null}
      {ready && settings ? <Settings /> : null}
      {errors ? <Errors onClose={toggleErrors} /> : null}
      {error ? <StoreError onClose={() => setError(false)} /> : null}
    </>
  );
};

export default Root;
