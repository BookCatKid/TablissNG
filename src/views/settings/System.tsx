import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { db, FaviconMode } from "../../db/state";
import { useKey } from "../../lib/db/react";
import TimeZoneInput from "../shared/timeZone/TimeZoneInput";
import { useSystemTheme } from "../../hooks";
import { Icon, IconButton } from "../shared";

const messages = defineMessages({
  faviconErrorSize: {
    id: "settings.favicon.error.size",
    defaultMessage: "Image must be smaller than 8KB",
  },
  faviconErrorRead: {
    id: "settings.favicon.error.read",
    defaultMessage: "Failed to read file. Please try again.",
  },
});

const positions = [
  {
    value: "topLeft",
    icon: "arrow-up-left",
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
    value: "bottomRight",
    icon: "arrow-down-right",
  },
] as const;

const System: React.FC = () => {
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
  const systemIsDark = useSystemTheme();

  function setHighlighting(checked: boolean) {
    setHighlightingEnabled(checked);
    const element = document.querySelector(".Widgets") as HTMLElement;
    if (element) {
      if (checked) {
        element.style.userSelect = "auto";
      } else {
        element.style.userSelect = "none";
      }
    }
  }

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setThemePreference(value);
    const isDark = value === "system" ? systemIsDark : value === "dark";
    document.body.className = isDark ? "dark" : "";
  };

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
          <option value="ar" title="Arabic">
            العربية
          </option>
          <option value="be" title="Belorussian">
            Беларуская
          </option>
          <option value="ca-ES" title="Catalan">
            Català
          </option>
          <option value="cs" title="Czech">
            Čeština
          </option>
          <option value="de" title="German">
            Deutsch
          </option>
          <option value="el" title="Greek">
            Ελληνικά
          </option>
          <option value="en-AU" title="English (Australian)">
            English (AU)
          </option>
          <option value="en-CA" title="English (Canadian)">
            English (CA)
          </option>
          <option value="en-GB" title="English (British)">
            English (GB)
          </option>
          <option value="en" title="English (American)">
            English (US)
          </option>
          <option value="es" title="Spanish">
            Español
          </option>
          <option value="fa" title="Persian">
            پارسی
          </option>
          <option value="fr" title="French">
            Français
          </option>
          <option value="he" title="Hebrew">
            עברית
          </option>
          <option value="ga" title="Gaeilge">
            Gaeilge
          </option>
          <option value="gd" title="Scottish Gaelic">
            Gàidhlig
          </option>
          <option value="gl" title="Galician">
            Galego
          </option>
          <option value="gu" title="Gujarati">
            ગુજરાતી
          </option>
          <option value="hi" title="Hindi">
            हिन्दी
          </option>
          <option value="hu" title="Hungarian">
            Magyar
          </option>
          <option value="id" title="Indonesian">
            Indonesian
          </option>
          <option value="it" title="Italian">
            Italiano
          </option>
          <option value="ja" title="Japanese">
            日本語
          </option>
          <option value="ko" title="Korean">
            한국어
          </option>
          <option value="kp" title="North Korean">
            조선말
          </option>
          <option value="lb" title="Luxembourgish">
            Lëtzebuergesch
          </option>
          <option value="lt" title="Lithuanian">
            Lietuvių k.
          </option>
          <option value="ne" title="Nepali">
            Nepali
          </option>
          <option value="nl" title="Dutch">
            Nederlands
          </option>
          <option value="no" title="Norwegian">
            Norsk
          </option>
          <option value="pl" title="Polish">
            Polski
          </option>
          <option value="pt-BR" title="Portuguese (Brazil)">
            Português do Brasil
          </option>
          <option value="pt" title="Portuguese (Portugal)">
            Português de Portugal
          </option>
          <option value="ro" title="Romanian">
            Română
          </option>
          <option value="ru" title="Russian">
            Русский
          </option>
          <option value="sk" title="Slovak">
            Slovenčina
          </option>
          <option value="sq" title="Albanian">
            Shqip
          </option>
          <option value="sr" title="Serbian">
            Српски
          </option>
          <option value="fi" title="Finnish">
            Suomi
          </option>
          <option value="sv" title="Swedish">
            Svenska
          </option>
          <option value="ta" title="Tamil">
            தமிழ்
          </option>
          <option value="th" title="Thai">
            ไทย
          </option>
          <option value="tr" title="Turkish">
            Türkçe
          </option>
          <option value="vi" title="Vietnamese">
            Tiếng Việt
          </option>
          <option value="zh-CN" title="Simplified Chinese (China)">
            中文（中国）
          </option>
          <option value="zh-TW" title="Traditional Chinese (Taiwan)">
            中文（台灣）
          </option>
          <option value="uk" title="Ukrainian">
            Українська
          </option>
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
            handleThemeChange(e.target.value as "light" | "dark" | "system")
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
              />
            </option>
            <option value="size32">
              <FormattedMessage
                id="settings.favicon.mode.size32"
                defaultMessage="32x32 Icon"
              />
            </option>
            <option value="size48">
              <FormattedMessage
                id="settings.favicon.mode.size48"
                defaultMessage="48x48 Icon"
              />
            </option>
            <option value="size96">
              <FormattedMessage
                id="settings.favicon.mode.size96"
                defaultMessage="96x96 Icon"
              />
            </option>
            <option value="size128">
              <FormattedMessage
                id="settings.favicon.mode.size128"
                defaultMessage="128x128 Icon"
              />
            </option>
            <option value="custom">
              <FormattedMessage
                id="settings.favicon.mode.custom"
                defaultMessage="File Upload..."
              />
            </option>
            <option value="url">
              <FormattedMessage
                id="settings.favicon.mode.url"
                defaultMessage="Custom URL..."
              />
            </option>
          </select>

          {favicon.mode === "url" && (
            <input
              type="text"
              placeholder="https://example.com/favicon.ico"
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
          <div className="u-grid-2x2-compact">
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
          onChange={(e) => setHighlighting(e.target.checked)}
        />
      </label>
      <label className="u-grid-2col">
        <span>
          <FormattedMessage
            id="settings.hideIcon"
            defaultMessage="Hide Settings Icon"
            description="Hide settings icon toggle label"
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
