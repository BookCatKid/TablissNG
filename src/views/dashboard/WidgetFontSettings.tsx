import React from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { WidgetDisplay } from "../../db/state";
import "./WidgetFontSettings.sass";

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
  const [localDisplay, setLocalDisplay] = React.useState<Partial<WidgetDisplay>>({
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

  const outlineStyle = localDisplay.textOutline ? localDisplay.textOutlineStyle ?? "basic" : null;

  return createPortal(
    <>
      <div className="widget-font-settings-backdrop" onClick={onClose} />
      <div className="WidgetFontSettings" role="dialog" aria-modal="true">
        <div className="settings-header">
          <h3>
            <Icon icon="feather:type" aria-hidden="true" />
            <span>{widgetName} · Font Settings</span>
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close font settings">
            <Icon icon="feather:x" />
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-grid">
            <label>
              <span>Font Family</span>
              <input
                type="text"
                value={localDisplay.fontFamily ?? ""}
                onChange={(event) => updateDisplay({ fontFamily: event.target.value })}
              />
            </label>

            <label>
              <span>Font Size</span>
              <input
                type="number"
                min={8}
                max={160}
                value={localDisplay.fontSize ?? 24}
                onChange={(event) => updateDisplay({ fontSize: Number(event.target.value) })}
              />
            </label>

            <label>
              <span>Font Weight</span>
              <select
                value={localDisplay.fontWeight?.toString() ?? ""}
                onChange={(event) =>
                  updateDisplay({
                    fontWeight: event.target.value ? Number(event.target.value) : undefined,
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

            <label className="toggle-field">
              <input
                type="checkbox"
                checked={localDisplay.fontStyle === "italic"}
                onChange={(event) =>
                  updateDisplay({ fontStyle: event.target.checked ? "italic" : "normal" })
                }
              />
              <span>Italic</span>
            </label>

            <label className="toggle-field">
              <input
                type="checkbox"
                checked={localDisplay.textDecoration === "underline"}
                onChange={(event) =>
                  updateDisplay({ textDecoration: event.target.checked ? "underline" : "none" })
                }
              />
              <span>Underline</span>
            </label>

            <label>
              <span>Colour</span>
              <input
                type="color"
                value={localDisplay.colour ?? defaultColour}
                onChange={(event) => updateDisplay({ colour: event.target.value })}
              />
            </label>
          </div>

          <div className="outline-section">
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={Boolean(localDisplay.textOutline)}
                onChange={(event) => updateDisplay({ textOutline: event.target.checked })}
              />
              <span>Enable Outline</span>
            </label>

            {localDisplay.textOutline ? (
              <div className="outline-grid">
                <label>
                  <span>Outline Style</span>
                  <select
                    value={localDisplay.textOutlineStyle ?? "basic"}
                    onChange={(event) =>
                      updateDisplay({ textOutlineStyle: event.target.value as "basic" | "advanced" })
                    }
                  >
                    <option value="basic">Basic (Shadow)</option>
                    <option value="advanced">Advanced (Stroke)</option>
                  </select>
                </label>

                <label>
                  <span>Outline Colour</span>
                  <input
                    type="color"
                    value={localDisplay.textOutlineColor ?? defaultOutlineColour}
                    onChange={(event) => updateDisplay({ textOutlineColor: event.target.value })}
                  />
                </label>

                {localDisplay.textOutlineStyle === "advanced" ? (
                  <label>
                    <span>Outline Size</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={localDisplay.textOutlineSize ?? 1}
                      onChange={(event) =>
                        updateDisplay({ textOutlineSize: Number(event.target.value) })
                      }
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="preview-block">
            <span className="preview-label">Live Preview</span>
            <div className="preview-card">
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
                      color: localDisplay.textOutlineColor ?? defaultOutlineColour,
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
      </div>
    </>,
    document.body,
  );
};

export default WidgetFontSettings;
