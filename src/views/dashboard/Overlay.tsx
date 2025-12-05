import React from "react";
import { Icon } from "@iconify/react";
import { defineMessages, useIntl } from "react-intl";
import { ErrorContext } from "../../contexts/error";
import { UiContext } from "../../contexts/ui";
import { toggleFocus } from "../../db/action";
import { db } from "../../db/state";
import { useFullscreen, useKeyPress } from "../../hooks";
import { useKey, useValue } from "../../lib/db/react";
import "./Overlay.sass";

const messages = defineMessages({
  addWidgetHint: {
    id: "dashboard.addWidgetHint",
    defaultMessage: "Add widget",
    description: "Hover hint text for the add widget icon",
  },
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

const positionStyles: Record<Position, React.CSSProperties> = {
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

type CreditKey =
  | "unsplashPhoto"
  | "unsplashLocation"
  | "wikimediaTitle"
  | "wikimediaCopyright"
  | "giphy"
  | "apod";

const creditSelectors: Record<CreditKey, string> = {
  unsplashPhoto: ".credit .photo",
  unsplashLocation: ".credit .location-wrapper",
  wikimediaTitle: ".wikimedia-credit-title",
  wikimediaCopyright: ".wikimedia-credit-copyright",
  giphy: ".credit:has(.giphy-logo)",
  apod: ".apod-credit",
};

const creditTransforms: Record<Position, Partial<Record<CreditKey, string>>> = {
  topLeft: {},
  topRight: {},
  bottomLeft: {
    unsplashPhoto: "translateY(-2.5em)",
    wikimediaTitle: "translateY(-2em)",
    giphy: "translateY(-2em)",
    apod: "translateY(-3em)",
  },
  bottomRight: {
    unsplashLocation: "translateY(-2.5em)",
    wikimediaCopyright: "translateY(-3em)",
  },
};

const baseOverlayClass = "Overlay";

const Overlay: React.FC = () => {
  const intl = useIntl();
  const focus = useValue(db, "focus");
  const { errors } = React.useContext(ErrorContext);
  const {
    pending,
    toggleErrors,
    toggleSettings,
    toggleAddWidget,
    addWidgetOpen,
  } = React.useContext(UiContext);
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");

  useKeyPress(toggleFocus, ["w", "W"]);
  useKeyPress(toggleSettings, ["s", "S"]);
  useKeyPress(toggleAddWidget, ["q", "Q"]);

  const [isFullscreen, handleToggleFullscreen] = useFullscreen();
  const handleFullscreenKeyPress = React.useCallback(() => {
    if (handleToggleFullscreen) {
      handleToggleFullscreen();
    }
  }, [handleToggleFullscreen]);
  useKeyPress(handleFullscreenKeyPress, ["f"]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const transforms = creditTransforms[settingsIconPosition as Position] ?? {};
    Object.entries(creditSelectors).forEach(([key, selector]) => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) {
        return;
      }
      element.style.transform = transforms[key as CreditKey] ?? "0";
    });
  }, [settingsIconPosition]);

  const overlayClassName = [baseOverlayClass, settingsIconPosition]
    .filter(Boolean)
    .join(" ");
  const positioning = positionStyles[settingsIconPosition as Position] ?? positionStyles.topLeft;

  return (
    <div className={overlayClassName} style={positioning}>
      <button
        type="button"
        className={addWidgetOpen ? "active" : ""}
        onClick={toggleAddWidget}
        title={`${intl.formatMessage(messages.addWidgetHint)} (Q)`}
        aria-pressed={addWidgetOpen}
      >
        <Icon icon="feather:plus-circle" />
      </button>

      <button
        type="button"
        onClick={toggleSettings}
        title={`${intl.formatMessage(messages.settingsHint)} (S)`}
      >
        <Icon icon="feather:settings" />
      </button>

      {errors.length > 0 ? (
        <button type="button" onClick={toggleErrors} title={intl.formatMessage(messages.errorHint)}>
          <Icon icon="feather:alert-triangle" />
        </button>
      ) : null}

      {pending > 0 ? (
        <span title={intl.formatMessage(messages.loadingHint)}>
          <Icon icon="feather:zap" />
        </span>
      ) : null}

      <button
        type="button"
        className={focus ? "" : "on-hover"}
        onClick={toggleFocus}
        title={`${intl.formatMessage(messages.focusHint)} (W)`}
      >
        <Icon icon={`feather:${focus ? "eye-off" : "eye"}`} />
      </button>

      {handleToggleFullscreen ? (
        <button
          type="button"
          className="on-hover"
          onClick={handleToggleFullscreen}
          title={`${intl.formatMessage(messages.fullscreenHint)} (F)`}
        >
          <Icon icon={`feather:${isFullscreen ? "minimize-2" : "maximize-2"}`} />
        </button>
      ) : null}
    </div>
  );
};

export default Overlay;
