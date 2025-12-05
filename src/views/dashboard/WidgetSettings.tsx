import React from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { WidgetPosition } from "../../db/state";
import type { API } from "../../plugins";
import PluginContainer from "../shared/Plugin";
import "./WidgetSettings.sass";

interface WidgetSettingsProps {
  widgetName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onStartReposition: () => void;
  onScaleChange: (value: number) => void;
  onQuickAlign: (position: WidgetPosition) => void;
  scale: number;
  currentPosition: WidgetPosition;
  position: { x: number; y: number };
  mode: "layout" | "widget";
  settingsComponent?: React.ComponentType<API<unknown, unknown>>;
  pluginId?: string;
}

const quickAlignOptions: { label: string; value: WidgetPosition }[] = [
  { label: "Top Left", value: "topLeft" },
  { label: "Top Center", value: "topCentre" },
  { label: "Top Right", value: "topRight" },
  { label: "Middle Left", value: "middleLeft" },
  { label: "Middle", value: "middleCentre" },
  { label: "Middle Right", value: "middleRight" },
  { label: "Bottom Left", value: "bottomLeft" },
  { label: "Bottom Center", value: "bottomCentre" },
  { label: "Bottom Right", value: "bottomRight" },
];

const WidgetSettings: React.FC<WidgetSettingsProps> = ({
  widgetName,
  isOpen,
  onClose,
  onDelete,
  onStartReposition,
  onScaleChange,
  onQuickAlign,
  scale,
  currentPosition,
  position,
  mode,
  settingsComponent,
  pluginId,
}) => {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const isWidgetMode = mode === "widget";
  const canRenderPluginSettings = Boolean(isWidgetMode && settingsComponent && pluginId);

  return createPortal(
    <>
      <div className="widget-settings-backdrop" onClick={onClose} />
      <div
        className={`WidgetSettings ${isWidgetMode ? "WidgetSettings--plugin" : ""}`.trim()}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="settings-header">
          <div className="header-glow" />
          <h3>{widgetName}</h3>
          <button className="close-btn" onClick={onClose}>
            <Icon icon="feather:x" />
          </button>
        </div>

        <div className="settings-content">
          {isWidgetMode ? (
            canRenderPluginSettings ? (
              <div className="widget-plugin-settings">
                <PluginContainer id={pluginId!} component={settingsComponent!} />
              </div>
            ) : (
              <div className="widget-settings-empty">
                <p>No additional settings available for this widget.</p>
              </div>
            )
          ) : (
            <>
              <div className="setting-group holo-card">
                <div className="setting-label has-action">
                  <div className="label-main">
                    <Icon icon="feather:move" />
                    <span>Reposition</span>
                  </div>
                  <button
                    className="holo-icon-btn"
                    onClick={onStartReposition}
                    title="Activate freeform mode to drag this widget anywhere in space."
                    aria-label="Enter freeform mode"
                  >
                    <Icon icon="feather:crosshair" />
                  </button>
                </div>
              </div>

              <div className="setting-group holo-card">
                <div className="setting-label">
                  <Icon icon="feather:maximize-2" />
                  <span>Scale</span>
                  <span className="setting-value">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.05"
                  value={scale}
                  onChange={(event) => onScaleChange(parseFloat(event.target.value))}
                />
              </div>

              <div className="setting-group holo-card">
                <div className="setting-label">
                  <Icon icon="feather:grid" />
                  <span>Snap Alignment</span>
                </div>
                <div className="quick-align-grid">
                  {quickAlignOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`holo-chip ${
                        currentPosition === option.value ? "active" : ""
                      }`}
                      onClick={() => onQuickAlign(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-divider" />

              <button className="delete-btn" onClick={onDelete}>
                <Icon icon="feather:trash-2" />
                <span>Remove Widget</span>
              </button>
            </>
          )}
        </div>

        {/* Corner decorations */}
        <div className="corner-decoration top-left" />
        <div className="corner-decoration top-right" />
        <div className="corner-decoration bottom-left" />
        <div className="corner-decoration bottom-right" />
      </div>
    </>,
    document.body,
  );
};

export default WidgetSettings;
