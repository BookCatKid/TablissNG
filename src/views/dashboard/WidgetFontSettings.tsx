import "./WidgetFontSettings.sass";

import { Icon } from "@iconify/react";
import React from "react";
import { createPortal } from "react-dom";

import { WidgetDisplay } from "../../db/state";

interface WidgetFontSettingsProps {
  widgetName: string;
  isOpen: boolean;
  display: WidgetDisplay;
  onClose: () => void;
  onSave: (next: Partial<WidgetDisplay>) => void;
}

const defaultColour = "#ffffff";
const defaultOutlineColour = "#000000";

const fontWeightOptions = [
  { label: "Default", value: "" },
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Bold", value: "700" },
  { label: "Black", value: "900" },
];

const WidgetFontSettings: React.FC<WidgetFontSettingsProps> = ({
  widgetName,
  isOpen,
  display,
  onClose,
  onSave,
}) => {
  const titleId = React.useId();
  const italicFieldId = React.useId();
  const underlineFieldId = React.useId();
  const outlineFieldId = React.useId();
  const [localDisplay, setLocalDisplay] = React.useState<
    Partial<WidgetDisplay>
  >({
    colour: defaultColour,
    fontFamily: "",
    fontSize: 24,
    fontWeight: undefined,
    fontStyle: "normal",
    textDecoration: "none",
    textOutline: false,
    textOutlineStyle: "basic",
    textOutlineColor: defaultOutlineColour,
    textOutlineSize: 1,
  });

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    setLocalDisplay({
      colour: display.colour ?? defaultColour,
      fontFamily: display.fontFamily ?? "",
      fontSize: display.fontSize ?? 24,
      fontWeight: display.fontWeight,
      fontStyle: display.fontStyle ?? "normal",
      textDecoration: display.textDecoration ?? "none",
      textOutline: display.textOutline ?? false,
      textOutlineStyle: display.textOutlineStyle ?? "basic",
      textOutlineColor: display.textOutlineColor ?? defaultOutlineColour,
      textOutlineSize: display.textOutlineSize ?? 1,
    });
  }, [display, isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const updateDisplay = (next: Partial<WidgetDisplay>) => {
    setLocalDisplay((current) => ({ ...current, ...next }));
  };

  const handleSave = () => {
    onSave(localDisplay);
    onClose();
  };

  const previewStyle: React.CSSProperties = {
    color: localDisplay.colour ?? defaultColour,
    fontFamily: localDisplay.fontFamily || undefined,
    fontSize: `${localDisplay.fontSize ?? 24}px`,
    fontWeight: localDisplay.fontWeight,
    fontStyle: localDisplay.fontStyle,
    textDecoration: localDisplay.textDecoration,
  };

  const outlineStyle = localDisplay.textOutline
    ? (localDisplay.textOutlineStyle ?? "basic")
    : null;
  const fontColourLabel = (localDisplay.colour ?? defaultColour).toUpperCase();
  const outlineColourLabel = (
    localDisplay.textOutlineColor ?? defaultOutlineColour
  ).toUpperCase();

  return createPortal(
    <>
      <div
        className="WidgetFontSettings"
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className="settings-header">
          <div className="header-glow" aria-hidden="true" />
          <h3 id={titleId}>
            <Icon icon="feather:type" aria-hidden="true" />
            <span>{widgetName} - Font Settings</span>
          </h3>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close font settings"
          >
            <Icon icon="feather:x" />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group holo-card font-settings-card">
            <div className="settings-grid">
              <label className="stacked-input">
                <span>Font Family</span>
                <input
                  type="text"
                  value={localDisplay.fontFamily ?? ""}
                  onChange={(event) =>
                    updateDisplay({ fontFamily: event.target.value })
                  }
                />
              </label>

              <label className="stacked-input compact">
                <span>Font Size</span>
                <input
                  type="number"
                  min={8}
                  max={160}
                  value={localDisplay.fontSize ?? 24}
                  onChange={(event) =>
                    updateDisplay({ fontSize: Number(event.target.value) })
                  }
                />
              </label>

              <label className="stacked-input compact">
                <span>Font Weight</span>
                <select
                  value={localDisplay.fontWeight?.toString() ?? ""}
                  onChange={(event) =>
                    updateDisplay({
                      fontWeight: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                >
                  {fontWeightOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="stacked-input compact colour-input">
                <span>Colour</span>
                <div className="colour-field">
                  <input
                    type="color"
                    value={localDisplay.colour ?? defaultColour}
                    onChange={(event) =>
                      updateDisplay({ colour: event.target.value })
                    }
                  />
                  <span className="colour-value" aria-live="polite">
                    {fontColourLabel}
                  </span>
                </div>
              </label>

              <div className="stacked-input toggle-field">
                <span id={italicFieldId}>Italic</span>
                <label
                  className="slider-toggle"
                  aria-labelledby={italicFieldId}
                >
                  <input
                    type="checkbox"
                    checked={localDisplay.fontStyle === "italic"}
                    onChange={(event) =>
                      updateDisplay({
                        fontStyle: event.target.checked ? "italic" : "normal",
                      })
                    }
                  />
                  <span className="slider-track">
                    <span className="slider-thumb" />
                  </span>
                  <span className="slider-status">
                    {localDisplay.fontStyle === "italic" ? "On" : "Off"}
                  </span>
                </label>
              </div>

              <div className="stacked-input toggle-field">
                <span id={underlineFieldId}>Underline</span>
                <label
                  className="slider-toggle"
                  aria-labelledby={underlineFieldId}
                >
                  <input
                    type="checkbox"
                    checked={localDisplay.textDecoration === "underline"}
                    onChange={(event) =>
                      updateDisplay({
                        textDecoration: event.target.checked
                          ? "underline"
                          : "none",
                      })
                    }
                  />
                  <span className="slider-track">
                    <span className="slider-thumb" />
                  </span>
                  <span className="slider-status">
                    {localDisplay.textDecoration === "underline" ? "On" : "Off"}
                  </span>
                </label>
              </div>

              <div className="stacked-input toggle-field">
                <span id={outlineFieldId}>Outline</span>
                <label
                  className="slider-toggle"
                  aria-labelledby={outlineFieldId}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(localDisplay.textOutline)}
                    onChange={(event) =>
                      updateDisplay({ textOutline: event.target.checked })
                    }
                  />
                  <span className="slider-track">
                    <span className="slider-thumb" />
                  </span>
                  <span className="slider-status">
                    {localDisplay.textOutline ? "On" : "Off"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {localDisplay.textOutline ? (
            <div className="setting-group holo-card outline-card">
              <div className="outline-grid">
                <label className="stacked-input compact">
                  <span>Outline Style</span>
                  <select
                    value={localDisplay.textOutlineStyle ?? "basic"}
                    onChange={(event) =>
                      updateDisplay({
                        textOutlineStyle: event.target.value as
                          | "basic"
                          | "advanced",
                      })
                    }
                  >
                    <option value="basic">Basic (Shadow)</option>
                    <option value="advanced">Advanced (Stroke)</option>
                  </select>
                </label>

                <label className="stacked-input compact colour-input">
                  <span>Outline Colour</span>
                  <div className="colour-field">
                    <input
                      type="color"
                      value={
                        localDisplay.textOutlineColor ?? defaultOutlineColour
                      }
                      onChange={(event) =>
                        updateDisplay({ textOutlineColor: event.target.value })
                      }
                    />
                    <span className="colour-value" aria-live="polite">
                      {outlineColourLabel}
                    </span>
                  </div>
                </label>

                {localDisplay.textOutlineStyle === "advanced" ? (
                  <label className="stacked-input compact">
                    <span>Outline Size</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={localDisplay.textOutlineSize ?? 1}
                      onChange={(event) =>
                        updateDisplay({
                          textOutlineSize: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="setting-group holo-card preview-card-wrapper">
            <span className="preview-label">Live Preview</span>
            <div className="preview-card" aria-live="polite">
              {outlineStyle && outlineStyle === "basic" ? (
                <div
                  style={{
                    ...previewStyle,
                    textShadow: `-1px -1px 0 ${localDisplay.textOutlineColor ?? defaultOutlineColour}, 1px -1px 0 ${
                      localDisplay.textOutlineColor ?? defaultOutlineColour
                    }, -1px 1px 0 ${localDisplay.textOutlineColor ?? defaultOutlineColour}, 1px 1px 0 ${
                      localDisplay.textOutlineColor ?? defaultOutlineColour
                    }`,
                  }}
                >
                  The quick brown fox
                </div>
              ) : outlineStyle === "advanced" ? (
                <div className="preview-stack">
                  <span
                    className="preview-outline"
                    style={{
                      ...previewStyle,
                      color:
                        localDisplay.textOutlineColor ?? defaultOutlineColour,
                      WebkitTextStroke: `${(localDisplay.textOutlineSize ?? 1) * 2}px ${
                        localDisplay.textOutlineColor ?? defaultOutlineColour
                      }`,
                    }}
                  >
                    The quick brown fox
                  </span>
                  <span className="preview-top" style={previewStyle}>
                    The quick brown fox
                  </span>
                </div>
              ) : (
                <span style={previewStyle}>The quick brown fox</span>
              )}
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        <div className="corner-decoration top-left" />
        <div className="corner-decoration top-right" />
        <div className="corner-decoration bottom-left" />
        <div className="corner-decoration bottom-right" />
      </div>
    </>,
    document.body,
  );
};

export default WidgetFontSettings;
