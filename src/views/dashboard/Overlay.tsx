import React from "react";
import { defineMessages, useIntl } from "react-intl";
import { ErrorContext } from "../../contexts/error";
import { UiContext } from "../../contexts/ui";
import { toggleFocus } from "../../db/action";
import { db } from "../../db/state";
import { useFullscreen, useKeyPress } from "../../hooks";
import { useValue, useKey } from "../../lib/db/react";
import { Icon } from "@iconify/react";
import "./Overlay.sass";

const messages = defineMessages({
  settingsHint: {
    id: "dashboard.settingsHint",
    defaultMessage: "Customise Tabliss",
    description: "Hover hint text for the settings icon",
  },
  focusHint: {
    id: "dashboard.focusHint",
    defaultMessage: "Toggle widgets",
    description: "Hover hint text for the widgets toggle",
  },
  fullscreenHint: {
    id: "dashboard.fullscreenHint",
    defaultMessage: "Toggle fullscreen",
    description: "Hover hint text for the fullscreen toggle",
  },
  loadingHint: {
    id: "dashboard.loadingHint",
    defaultMessage: "Loading new content",
    description:
      "Hover hint text for the loading indicator icon (the lightning bolt)",
  },
  errorHint: {
    id: "dashboard.errorHint",
    defaultMessage: "Show errors",
    description: "Hover hint text for the error indicator icon",
  },
});

type Position = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

const mapping: Record<Position, React.CSSProperties> = {
  topLeft: {
    top: "0",
    bottom: "auto",
    left: "0",
  },
  topRight: {
    top: "0",
    right: "0",
    left: "auto",
    flexDirection: "row-reverse",
  },
  bottomLeft: {
    bottom: "0",
    top: "auto",
    left: "0",
  },
  bottomRight: {
    bottom: "0",
    right: "0",
    top: "auto",
    left: "auto",
    flexDirection: "row-reverse",
  },
};

const Overlay: React.FC = () => {
  const intl = useIntl();
  const focus = useValue(db, "focus");
  const { errors } = React.use(ErrorContext);
  const { pending, toggleErrors, toggleSettings } = React.use(UiContext);
  const [hideSettingsIcon] = useKey(db, "hideSettingsIcon");
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");

  useKeyPress(toggleFocus, ["w"]);
  useKeyPress(toggleSettings, ["s"]);

  // Hooks inside a condition? Works because the condition always resolves the same
  const [isFullscreen, handleToggleFullscreen] = useFullscreen();
  if (handleToggleFullscreen) useKeyPress(handleToggleFullscreen, ["f"]);

  const unsplashCreditPhotoElement = document.querySelector(
    ".credit .photo",
  ) as HTMLElement;
  const unsplashCreditLocationElement = document.querySelector(
    ".credit .location-wrapper",
  ) as HTMLElement;
  const wikimediaTitleCredit = document.querySelector(
    ".wikimedia-credit-title",
  ) as HTMLElement;
  const wikimediaCopyrightCredit = document.querySelector(
    ".wikimedia-credit-copyright",
  ) as HTMLElement;
  const giphyCreditElement = document.querySelector(
    ".credit:has(.giphy-logo)",
  ) as HTMLElement;
  const apodCreditElement = document.querySelector(
    ".apod-credit",
  ) as HTMLElement;

  if (unsplashCreditPhotoElement) {
    unsplashCreditPhotoElement.style.transform =
      settingsIconPosition === "bottomLeft" ? "translateY(-2.5em)" : "0";
  }
  if (unsplashCreditLocationElement) {
    unsplashCreditLocationElement.style.transform =
      settingsIconPosition === "bottomRight" ? "translateY(-2.5em)" : "0";
  }
  if (wikimediaTitleCredit) {
    wikimediaTitleCredit.style.transform =
      settingsIconPosition === "bottomLeft" ? "translateY(-2em)" : "0";
  }
  if (wikimediaCopyrightCredit) {
    wikimediaCopyrightCredit.style.transform =
      settingsIconPosition === "bottomRight" ? "translateY(-3em)" : "0";
  }
  if (giphyCreditElement) {
    giphyCreditElement.style.transform =
      settingsIconPosition === "bottomLeft" ? "translateY(-2em)" : "0";
  }
  if (apodCreditElement) {
    apodCreditElement.style.transform =
      settingsIconPosition === "bottomLeft" ? "translateY(-3em)" : "0";
  }

  return (
    <div
      className={`Overlay ${settingsIconPosition}`}
      style={mapping[settingsIconPosition as Position] || mapping.topLeft}
    >
      <a
        onClick={toggleSettings}
        title={`${intl.formatMessage(messages.settingsHint)} (S)`}
        className={hideSettingsIcon ? "on-hover" : ""}
      >
        <Icon icon="feather:settings" />
      </a>

      {errors.length > 0 ? (
        <a
          onClick={toggleErrors}
          title={intl.formatMessage(messages.errorHint)}
        >
          <Icon icon="feather:alert-triangle" />
        </a>
      ) : null}

      {pending > 0 ? (
        <span title={intl.formatMessage(messages.loadingHint)}>
          <Icon icon="feather:zap" />
        </span>
      ) : null}

      <a
        className={focus ? "" : "on-hover"}
        onClick={toggleFocus}
        title={`${intl.formatMessage(messages.focusHint)} (W)`}
      >
        <Icon icon={`feather:${focus ? "eye-off" : "eye"}`} />
      </a>

      {handleToggleFullscreen ? (
        <a
          className="on-hover"
          onClick={handleToggleFullscreen}
          title={`${intl.formatMessage(messages.fullscreenHint)} (F)`}
        >
          <Icon
            icon={`feather:${isFullscreen ? "minimize-2" : "maximize-2"}`}
          />
        </a>
      ) : null}
    </div>
  );
};

export default Overlay;
