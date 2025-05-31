import React from "react";
import { FormattedMessage, defineMessages } from "react-intl";
import { WidgetDisplay as WidgetDisplayType } from "../../db/state";
import PositionInput from "./PositionInput";
import "./WidgetDisplay.css";
import { pluginMessages } from "../../locales/messages";

type Props = {
  display: WidgetDisplayType;
  onChange: (display: Partial<WidgetDisplayType>) => void;
};

const messages = defineMessages({
  editPosition: {
    id: "settings.position.edit",
    defaultMessage: "Edit Position",
    description: "Button text for editing widget position"
  }
});

const WidgetDisplay: React.FC<Props> = ({ display, onChange }) => {
  return (
    <div className="WidgetDisplay">
      <PositionInput
        value={display.position}
        onChange={(position) => {
          onChange({
            position,
            isEditingPosition: false,
          });
        }}
      />

      {display.position === "free" && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => onChange({ isEditingPosition: !display.isEditingPosition })}
              className={`button button--primary ${display.isEditingPosition ? "active" : ""}`}
            >
              <FormattedMessage
                {...(display.isEditingPosition
                  ? pluginMessages.freeMoveSave
                  : messages.editPosition)}
              />
            </button>
            <button
              onClick={() => {onChange({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); window.location.reload();}}
              className="button button--primary"
            >
              <FormattedMessage
                id="settings.position.reset"
                defaultMessage="Reset Position"
                description="Button text to reset widget position"
              />
            </button>
          </div>
          {display.isEditingPosition && (
            <p className="info">
              <FormattedMessage
                id="settings.position.drag"
                defaultMessage="Drag the widget to adjust its position"
                description="Help text shown when editing widget position"
              />
            </p>
          )}
        </div>
      )}

      <label>
        <FormattedMessage
          id="settings.font.size"
          defaultMessage="Font Size"
          description="Font Size slider title"
        />
        <br />
        <input
          type="range"
          value={display.fontSize}
          min="2"
          max="100"
          step="2"
          onChange={(event) =>
            onChange({ fontSize: Number(event.target.value) })
          }
        />
      </label>

      <label>
        <FormattedMessage
          id="settings.scale"
          defaultMessage="Scale"
          description="Scale slider title"
        />
        <br />
        <input
          type="range"
          value={display.scale}
          list="scale-markers"
          min="0"
          max="2"
          step="0.1"
          onChange={(event) =>
            onChange({ scale: Number(event.target.value) })
          }
        />
        <datalist id="scale-markers">
          {/* <option value="0.5" label="-0.5" /> */}
          <option value="1" label="Default" />
          {/* <option value="1.5" label="+0.5" /> */}
        </datalist>
      </label>

      <label>
        <FormattedMessage
          id="settings.rotation"
          defaultMessage="Rotation"
          description="Rotation slider title"
        />
        <br />
        <input
          type="range"
          value={display.rotation ?? 0}
          min="-180"
          max="180"
          step="0.1"
          list="rotation-markers"
          onChange={(event) =>
            onChange({ rotation: Number(event.target.value) })
          }
        />
        <datalist id="rotation-markers">
          <option value="-180" label="-180°" />
          <option value="-90" label="-90°" />
          <option value="0" label="0°" />
          <option value="90" label="90°" />
          <option value="180" label="180°" />
        </datalist>
      </label>

      <label>
        Custom CSS Class
        <br />
        <input
          type="text"
          value={display.customClass}
          placeholder="Enter a custom class for easier styling"
          onChange={(event) =>
            onChange({ customClass: event.target.value })
          }
        />
      </label>
    </div>
  );
};

export default WidgetDisplay;
