import "./Overlay.sass";

import { Icon } from "@iconify/react";
import { type FC, useContext } from "react";
import { defineMessages, useIntl } from "react-intl";

import { ErrorContext } from "../../contexts/error";
import { UiContext } from "../../contexts/ui";
import { toggleFocus } from "../../db/action";
import { db } from "../../db/state";
import { useFullscreen, useKeyPress } from "../../hooks";
import { useKey, useValue } from "../../lib/db/react";

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

const Overlay: FC = () => {
  const intl = useIntl();
  const focus = useValue(db, "focus");
  const { errors } = useContext(ErrorContext);
  const {
    pending,
    toggleErrors,
    toggleSettings,
    toggleAddWidget,
    addWidgetOpen,
  } = useContext(UiContext);
  const [hideSettingsIcon] = useKey(db, "hideSettingsIcon");
  const [settingsIconPosition] = useKey(db, "settingsIconPosition");

  useKeyPress(toggleFocus, ["w", "W"]);
  useKeyPress(toggleSettings, ["s", "S"]);
  useKeyPress(toggleAddWidget, ["q", "Q"]);

  const [isFullscreen, handleToggleFullscreen] = useFullscreen();
  useKeyPress(handleToggleFullscreen || null, ["f", "F"]);

  const isCenter =
    settingsIconPosition === "topCentre" ||
    settingsIconPosition === "bottomCentre";

  const wrapperClass = `Overlay ${settingsIconPosition}${hideSettingsIcon ? " hidden" : ""}`;

  const addWidgetBtn = (
    <button
      type="button"
      className={addWidgetOpen ? "active" : ""}
      onClick={toggleAddWidget}
      title={`${intl.formatMessage(messages.addWidgetHint)} (Q)`}
      aria-pressed={addWidgetOpen}
    >
      <Icon icon="feather:plus-circle" />
    </button>
  );

  const settingsBtn = (
    <button
      type="button"
      onClick={toggleSettings}
      title={`${intl.formatMessage(messages.settingsHint)} (S)`}
    >
      <Icon icon="feather:settings" />
    </button>
  );

  const errorBtn = errors.length > 0 && (
    <button
      type="button"
      onClick={toggleErrors}
      title={intl.formatMessage(messages.errorHint)}
    >
      <Icon icon="feather:alert-triangle" />
    </button>
  );

  const loadingBtn = pending > 0 && (
    <span title={intl.formatMessage(messages.loadingHint)}>
      <Icon icon="feather:zap" />
    </span>
  );

  const focusBtn = (
    <button
      type="button"
      className={focus ? "" : "on-hover"}
      onClick={toggleFocus}
      title={`${intl.formatMessage(messages.focusHint)} (W)`}
    >
      <Icon icon={`feather:${focus ? "eye-off" : "eye"}`} />
    </button>
  );

  const fullscreenBtn = handleToggleFullscreen && (
    <button
      type="button"
      className="on-hover"
      onClick={handleToggleFullscreen}
      title={`${intl.formatMessage(messages.fullscreenHint)} (F)`}
    >
      <Icon icon={`feather:${isFullscreen ? "minimize-2" : "maximize-2"}`} />
    </button>
  );

  if (isCenter) {
    return (
      <div className={wrapperClass}>
        <div className="Overlay__group Overlay__group--side Overlay__group--left">
          {fullscreenBtn}
        </div>
        <div className="Overlay__group Overlay__group--center">
          {addWidgetBtn}
          {settingsBtn}
          {errorBtn}
          {loadingBtn}
          {focus && focusBtn}
        </div>
        <div className="Overlay__group Overlay__group--side Overlay__group--right">
          {!focus && focusBtn}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {addWidgetBtn}
      {settingsBtn}
      {errorBtn}
      {loadingBtn}
      {focusBtn}
      {fullscreenBtn}
    </div>
  );
};

export default Overlay;