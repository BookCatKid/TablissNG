import type { FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { db, FaviconMode } from "../../db/state";
import { useKey } from "../../lib/db/react";
import { localeOptions } from "../../locales/registry";
import { Icon, IconButton } from "../shared";
import TimeZoneInput from "../shared/timeZone/TimeZoneInput";

const messages = defineMessages({
  faviconErrorSize: {
    id: "settings.favicon.error.size",
    defaultMessage: "Image must be smaller than 8KB",
    description: "Error message when uploaded favicon is too large",
  },
  faviconErrorRead: {
    id: "settings.favicon.error.read",
    defaultMessage: "Failed to read file. Please try again.",
    description: "Error message when the favicon file cannot be read",
  },
  faviconPlaceholder: {
    id: "settings.favicon.placeholder",
    defaultMessage: "https://example.com/favicon.ico",
    description: "Placeholder for the custom favicon URL input",
  },
});

const positions = [
  {
    value: "topLeft",
    icon: "arrow-up-left",
  },
  {
    value: "topCentre",
    icon: "arrow-up",
  },
  {
    value: "topRight",
    icon: "arrow-up-right",
  },
  {
    value: "bottomLeft",
    icon: "arrow-down-left",
  },
  {
    value: "bottomCentre",
    icon: "arrow-down",
  },
  {
    value: "bottomRight",
    icon: "arrow-down-right",
  },
] as const;

const System: FC = () => {
  const intl = useIntl();
  const [locale, setLocale] = useKey(db, "locale");
  const [timeZone, setTimeZone] = useKey(db, "timeZone");
  const [highlightingEnabled, setHighlightingEnabled] = useKey(
    db,
    "highlightingEnabled",
  );
  const [hideSettingsIcon, setHideSettingsIcon] = useKey(
    db,
    "hideSettingsIcon",
  );
  const [settingsIconPosition, setSettingsIconPosition] = useKey(
    db,
    "settingsIconPosition",
  );
  const [themePreference, setThemePreference] = useKey(db, "themePreference");
  const [autoHideSettings, setAutoHideSettings] = useKey(
    db,
    "autoHideSettings",
  );
  const [favicon, setFavicon] = useKey(db, "favicon");
  const [accent, setAccent] = useKey(db, "accent");

  return (
    <div>
      <h2>
        <FormattedMessage
          id="settings"
          defaultMessage="Settings"
          description="Settings title"
        />
      </h2>

      <label className="u-grid-2col-wide">
        <span>
          <FormattedMessage
            id="language"
            defaultMessage="Language"
            description="Language title"
          />
        </span>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
        >
          {localeOptions.map((localeOption) => (
            <option
              key={localeOption.code}
              value={localeOption.code}
              title={localeOption.title}
            >
              {localeOption.label}
            </option>
          ))}
        </select>
      </label>

      <label className="u-grid-2col-wide">
        <FormattedMessage
          id="timeZone"
          defaultMessage="Time zone"
          description="Time zone title"
        />
        <TimeZoneInput timeZone={timeZone} onChange={setTimeZone} />
      </label>

      <label className="u-grid-2col-wide">
        <span>
          <FormattedMessage
            id="settings.theme"
            defaultMessage="Theme"
            description="Theme selection label"
          />
        </span>
        <select
          value={themePreference}
          onChange={(e) =>
            setThemePreference(e.target.value as "light" | "dark" | "system")
          }
        >
          <option value="light">
            <FormattedMessage
              id="settings.theme.light"
              defaultMessage="Light"
              description="Light theme option"
            />
          </option>
          <option value="dark">
            <FormattedMessage
              id="settings.theme.dark"
              defaultMessage="Dark"
              description="Dark theme option"
            />
          </option>
          <option value="system">
            <FormattedMessage
              id="settings.theme.system"
              defaultMessage="System"
              description="System theme option"
            />
          </option>
        </select>
      </label>

      <label className="u-grid-2col-wide">
        <span>
          <FormattedMessage
            id="settings.accentColor"
            defaultMessage="Accent Color"
            description="Global accent color picker label"
          />
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
          <button
            type="button"
            className="button button--primary"
            style={{ fontSize: "0.85em" }}
            onClick={() => setAccent("#3498db")}
          >
            <FormattedMessage
              id="settings.accentColor.reset"
              defaultMessage="Reset"
              description="Reset accent color to default"
            />
          </button>
        </div>
      </label>

      <label className="u-grid-2col-wide">
        <span>
          <FormattedMessage
            id="settings.favicon"
            defaultMessage="Favicon"
            description="Favicon setting label"
          />
        </span>
        <div>
          <select
            value={favicon.mode}
            onChange={(e) => {
              setFavicon({ ...favicon, mode: e.target.value as FaviconMode });
            }}
          >
            <option value="default">
              <FormattedMessage
                id="settings.favicon.mode.default"
                defaultMessage="Default"
                description="Dropdown option to use the default extension favicon"
              />
            </option>
            <option value="size32">
              <FormattedMessage
                id="settings.favicon.mode.size32"
                defaultMessage="32x32 Icon"
                description="Dropdown option to use a 32x32 icon as the favicon"
              />
            </option>
            <option value="size48">
              <FormattedMessage
                id="settings.favicon.mode.size48"
                defaultMessage="48x48 Icon"
                description="Dropdown option to use a 48x48 icon as the favicon"
              />
            </option>
            <option value="size96">
              <FormattedMessage
                id="settings.favicon.mode.size96"
                defaultMessage="96x96 Icon"
                description="Dropdown option to use a 96x96 icon as the favicon"
              />
            </option>
            <option value="size128">
              <FormattedMessage
                id="settings.favicon.mode.size128"
                defaultMessage="128x128 Icon"
                description="Dropdown option to use a 128x128 icon as the favicon"
              />
            </option>
            <option value="custom">
              <FormattedMessage
                id="settings.favicon.mode.custom"
                defaultMessage="File Upload..."
                description="Dropdown option to upload a custom favicon file"
              />
            </option>
            <option value="url">
              <FormattedMessage
                id="settings.favicon.mode.url"
                defaultMessage="Custom URL..."
                description="Dropdown option to use a custom URL for the favicon"
              />
            </option>
          </select>

          {favicon.mode === "url" && (
            <input
              type="text"
              placeholder={intl.formatMessage(messages.faviconPlaceholder)}
              value={favicon.url || ""}
              onChange={(e) => setFavicon({ ...favicon, url: e.target.value })}
            />
          )}

          {favicon.mode === "custom" && (
            <div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="favicon-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 8192) {
                      alert(intl.formatMessage(messages.faviconErrorSize));
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      setFavicon({ ...favicon, data: result });
                    };
                    reader.onerror = () => {
                      alert(intl.formatMessage(messages.faviconErrorRead));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                className="button button--primary"
                htmlFor="favicon-upload"
                style={{
                  cursor: "pointer",
                  margin: 0,
                  width: "100%",
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                <FormattedMessage
                  id="settings.selectFile"
                  defaultMessage="Select Image"
                  description="Select image file button"
                />
              </label>
            </div>
          )}
        </div>
      </label>

      <div className="u-grid-2col-icon-position">
        <label>
          <FormattedMessage
            id="settings.iconPosition"
            defaultMessage="Settings Icon Position"
            description="Settings icon position label"
          />
        </label>
        <div className="PositionInput">
          <div className="u-grid-3x2-compact">
            {positions.map((position) => (
              <IconButton
                key={position.value}
                onClick={() => setSettingsIconPosition(position.value)}
                primary={settingsIconPosition === position.value}
              >
                <Icon name={position.icon} />
              </IconButton>
            ))}
          </div>
        </div>
      </div>

      <label className="u-grid-2col">
        <span>
          <FormattedMessage
            id="settings.highlighting"
            defaultMessage="Allow Highlighting"
            description="Highlighting toggle label"
          />
        </span>
        <input
          type="checkbox"
          checked={highlightingEnabled}
          onChange={(e) => setHighlightingEnabled(e.target.checked)}
        />
      </label>
      <label className="u-grid-2col">
        <span>
          <FormattedMessage
            id="settings.hideIcon"
            defaultMessage="Hide Settings Toolbar"
            description="Hide settings toolbar toggle label"
          />
        </span>
        <input
          type="checkbox"
          checked={hideSettingsIcon}
          onChange={(e) => setHideSettingsIcon(e.target.checked)}
        />
      </label>

      <label className="u-grid-2col">
        <span>
          <FormattedMessage
            id="settings.hideMenu"
            defaultMessage="Auto-hide Settings Menu"
            description="Automaticaly hide settings label"
          />
        </span>
        <input
          type="checkbox"
          checked={autoHideSettings}
          onChange={(e) => setAutoHideSettings(e.target.checked)}
        />
      </label>
    </div>
  );
};

export default System;
