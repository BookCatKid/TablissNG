import { type FC, useContext, useEffect, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { usePushError } from "../api";
import { UiContext } from "../contexts/ui";
import { migrate } from "../db/migrate";
import { cacheStorage, db, dbStorage } from "../db/state";
import { useFavicon, useSystemTheme } from "../hooks";
import { Stream } from "../lib";
import { useValue } from "../lib/db/react";
import Dashboard from "./dashboard";
import { Settings } from "./settings";
import Errors from "./shared/Errors";
import StoreError from "./shared/StoreError";

const messages = defineMessages({
  pageTitle: {
    id: "app.pageTitle",
    description: "Page title that Tabliss displays in the title bar.",
    defaultMessage: "New Tab",
  },
  saveSettingsError: {
    id: "app.error.saveSettings",
    defaultMessage:
      "Cannot save your settings. You may have hit the maximum storage capacity.",
    description: "Error message when settings cannot be saved",
  },
  openSettingsError: {
    id: "app.error.openSettings",
    defaultMessage:
      "Cannot open settings storage. Your settings cannot be loaded or saved.",
    description: "Error message when settings storage cannot be opened",
  },
  saveCacheWarning: {
    id: "app.error.saveCache",
    defaultMessage: "Cannot save cache. Start up performance may be degraded.",
    description: "Warning message when cache cannot be saved",
  },
  openCacheWarning: {
    id: "app.error.openCache",
    defaultMessage: "Cannot open cache. Start up performance may be degraded.",
    description: "Warning message when cache storage cannot be opened",
  },
});

const Root: FC = () => {
  // Set page title
  const intl = useIntl();
  useEffect(() => {
    document.title = intl.formatMessage(messages.pageTitle);
  }, [intl]);

  // Wait for storage to be ready before displaying
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const themePreference = useValue(db, "themePreference");
  const systemIsDark = useSystemTheme();
  const accent = useValue(db, "accent");
  const highlightingEnabled = useValue(db, "highlightingEnabled");

  useEffect(() => {
    const isDark =
      themePreference === "system" ? systemIsDark : themePreference === "dark";
    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle(
      "no-highlight",
      highlightingEnabled === false,
    );
  }, [themePreference, systemIsDark, highlightingEnabled]);

  // Update CSS variable when accent color changes
  useEffect(() => {
    if (accent) {
      document.documentElement.style.setProperty("--accent-color", accent);
    }
  }, [accent]);

  useFavicon();

  const pushError = usePushError();

  useEffect(() => {
    const handleError =
      (message: string, showError: boolean) => (error: Error) => {
        pushError({ message });
        console.error(error);
        console.error("Caused by:", error.cause);
        if (showError) setError(true);
      };

    const subscriptions = Promise.all([
      // Config database
      dbStorage
        .then((errors) =>
          Stream.subscribe(
            errors,
            handleError(intl.formatMessage(messages.saveSettingsError), true),
          ),
        )
        .catch(
          handleError(intl.formatMessage(messages.openSettingsError), true),
        ),
      // Cache database
      cacheStorage
        .then((errors) =>
          Stream.subscribe(
            errors,
            handleError(intl.formatMessage(messages.saveCacheWarning), false),
          ),
        )
        .catch(
          handleError(intl.formatMessage(messages.openCacheWarning), false),
        ),
    ]);

    // Storage is ready
    subscriptions.then(() => {
      setReady(true);
      migrate();
    });

    return () => {
      // Remove error subscriptions
      subscriptions.then(([dbSub, cacheSub]) => {
        if (dbSub) dbSub();
        if (cacheSub) cacheSub();
      });
    };
  }, [intl, pushError]);

  const { errors, settings, toggleErrors } = useContext(UiContext);

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
