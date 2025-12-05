import React from "react";
import { Icon } from "@iconify/react";
import { useIntl } from "react-intl";
import FloatingSaveButton from "../shared/FloatingSaveButton";
import { WidgetDisplay, WidgetPosition } from "../../db/state";
import { removeWidget, setWidgetDisplay } from "../../db/action";
import { UiContext } from "../../contexts/ui";
import { getConfig } from "../../plugins";
import { isCustomCodeWidget } from "../../plugins/widgets/customCode";
import { isTextWidget } from "../../plugins/widgets/textWidgets";
import WidgetSettings from "./WidgetSettings";
import WidgetFontSettings from "./WidgetFontSettings";

interface WidgetProps extends WidgetDisplay {
  id: string;
  widgetKey: string;
  children: React.ReactNode;
}

const quickAlignOptions: { label: string; value: WidgetPosition; icon: string }[] = [
  { label: "Top Left", value: "topLeft", icon: "feather:arrow-up-left" },
  { label: "Top Center", value: "topCentre", icon: "feather:arrow-up" },
  { label: "Top Right", value: "topRight", icon: "feather:arrow-up-right" },
  { label: "Middle Left", value: "middleLeft", icon: "feather:arrow-left" },
  { label: "Middle", value: "middleCentre", icon: "feather:circle" },
  { label: "Middle Right", value: "middleRight", icon: "feather:arrow-right" },
  { label: "Bottom Left", value: "bottomLeft", icon: "feather:arrow-down-left" },
  { label: "Bottom Center", value: "bottomCentre", icon: "feather:arrow-down" },
  { label: "Bottom Right", value: "bottomRight", icon: "feather:arrow-down-right" },
];

type ControlName = "scale" | "rotate" | "snap";

const controlPopoverSizes: Record<ControlName, { width: number; height: number }> = {
  scale: { width: 200, height: 130 },
  rotate: { width: 200, height: 150 },
  snap: { width: 210, height: 260 },
};

type PopoverPlacement = {
  horizontal: "left" | "right";
  vertical: "top" | "bottom";
};

type ControlPlacement = {
  horizontal: "left" | "right";
  vertical: "top" | "bottom";
};

const Widget: React.FC<WidgetProps> = ({
  id,
  widgetKey,
  children,
  colour,
  fontFamily,
  fontSize = 24,
  scale = 1,
  rotation = 0,
  textOutline,
  textOutlineStyle = "basic",
  textOutlineSize = 1,
  textOutlineColor = "#000000",
  fontWeight,
  fontStyle,
  textDecoration,
  position,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2,
  xPercent = 50,
  yPercent = 50,
  isEditingPosition = false,
  customClass,
}) => {
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const quickMenuRef = React.useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [offset, setOffset] = React.useState({ x, y });
  const [width, setWidth] = React.useState<number | null>(null);
  const [height, setHeight] = React.useState<number | null>(null);
  const [activeControl, setActiveControl] = React.useState<ControlName | null>(null);
  const [localScale, setLocalScale] = React.useState(scale ?? 1);
  const [localRotation, setLocalRotation] = React.useState(rotation ?? 0);
  const [isRotationInputActive, setRotationInputActive] = React.useState(false);
  const [rotationInput, setRotationInput] = React.useState(() =>
    Math.round(rotation ?? 0).toString(),
  );
  const [popoverPlacement, setPopoverPlacement] = React.useState<PopoverPlacement>({
    horizontal: "right",
    vertical: "bottom",
  });
  const [controlPlacement, setControlPlacement] = React.useState<ControlPlacement>({
    horizontal: "right",
    vertical: "top",
  });
  const intl = useIntl();
  const { openCodeEditor, openTextEditor } = React.useContext(UiContext);
  const config = React.useMemo(() => getConfig(widgetKey), [widgetKey]);
  const widgetName = React.useMemo(() => intl.formatMessage(config.name), [intl, config.name]);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [fontSettingsOpen, setFontSettingsOpen] = React.useState(false);
  const [settingsMode, setSettingsMode] = React.useState<"layout" | "widget">("layout");
  const [settingsPosition, setSettingsPosition] = React.useState({ x: 0, y: 0 });
  const isCodeWidget = isCustomCodeWidget(widgetKey);
  const isTextWidgetKey = isTextWidget(widgetKey);

  const displaySnapshot = React.useMemo<WidgetDisplay>(
    () => ({
      position,
      colour,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      textOutline,
      textOutlineColor,
      textOutlineSize,
      textOutlineStyle,
    }),
    [
      position,
      colour,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      textOutline,
      textOutlineColor,
      textOutlineSize,
      textOutlineStyle,
    ],
  );

  const recalcSettingsPosition = React.useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(460, viewportWidth - padding * 2);
    const panelHeight = Math.min(520, viewportHeight - padding * 2);
    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));
    if (!widgetRef.current) {
      setSettingsPosition({
        x: clamp(
          viewportWidth / 2 - panelWidth / 2,
          padding,
          viewportWidth - panelWidth - padding,
        ),
        y: clamp(
          viewportHeight / 2 - panelHeight / 2,
          padding,
          viewportHeight - panelHeight - padding,
        ),
      });
      return;
    }
    const rect = widgetRef.current.getBoundingClientRect();
    let nextX = rect.left;
    if (nextX + panelWidth > viewportWidth - padding) {
      nextX = rect.right - panelWidth;
    }
    nextX = clamp(nextX, padding, viewportWidth - panelWidth - padding);

    let preferredY = rect.bottom + padding;
    if (preferredY + panelHeight > viewportHeight - padding) {
      preferredY = rect.top - panelHeight - padding;
    }
    const nextY = clamp(preferredY, padding, viewportHeight - panelHeight - padding);

    setSettingsPosition({
      x: nextX,
      y: nextY,
    });
  }, []);

  React.useEffect(() => {
    setLocalScale(scale ?? 1);
  }, [scale]);

  React.useEffect(() => {
    setLocalRotation(rotation ?? 0);
  }, [rotation]);

  React.useEffect(() => {
    if (!isRotationInputActive) {
      setRotationInput(Math.round(rotation ?? 0).toString());
    }
  }, [rotation, isRotationInputActive]);

  React.useEffect(() => {
    if (!activeControl) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!quickMenuRef.current) return;
      if (quickMenuRef.current.contains(event.target as Node)) {
        return;
      }
      setActiveControl(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeControl]);

  React.useEffect(() => {
    if (isEditingPosition) {
      setActiveControl(null);
    }
  }, [isEditingPosition]);

  const updateControlPlacement = React.useCallback(() => {
    if (!quickMenuRef.current || !widgetRef.current) {
      return;
    }

    const menuRect = quickMenuRef.current.getBoundingClientRect();
    const widgetRect = widgetRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 12;

    const availableLeft = widgetRect.left;
    const availableRight = viewportWidth - widgetRect.right;
    const availableTop = widgetRect.top;
    const availableBottom = viewportHeight - widgetRect.bottom;

    const needsLeft = availableLeft < menuRect.width + padding;
    const needsRight = availableRight < menuRect.width + padding;
    const needsTop = availableTop < menuRect.height + padding;
    const needsBottom = availableBottom < menuRect.height + padding;

    let horizontal: ControlPlacement["horizontal"] = "right";
    if (needsRight && !needsLeft) {
      horizontal = "left";
    } else if (needsRight && needsLeft) {
      horizontal = availableRight >= availableLeft ? "right" : "left";
    }

    let vertical: ControlPlacement["vertical"] = "top";
    if (needsTop && !needsBottom) {
      vertical = "bottom";
    } else if (needsTop && needsBottom) {
      vertical = availableTop >= availableBottom ? "top" : "bottom";
    }

    setControlPlacement((previous) => {
      if (previous.horizontal === horizontal && previous.vertical === vertical) {
        return previous;
      }
      return { horizontal, vertical };
    });
  }, []);

  React.useLayoutEffect(() => {
    updateControlPlacement();
  }, [updateControlPlacement, offset.x, offset.y, width, height, position]);

  const updatePopoverPlacement = React.useCallback(() => {
    if (!activeControl || !quickMenuRef.current) {
      return;
    }

    const rect = quickMenuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;
    const size = controlPopoverSizes[activeControl];

    const availableLeft = rect.left;
    const availableRight = viewportWidth - rect.right;
    const availableAbove = rect.top;
    const availableBelow = viewportHeight - rect.bottom;

    const needsLeftSpace = size.width + padding > availableLeft;
    const needsRightSpace = size.width + padding > availableRight;
    const needsTopSpace = size.height + padding > availableAbove;
    const needsBottomSpace = size.height + padding > availableBelow;

    let horizontal: PopoverPlacement["horizontal"];
    if (!needsLeftSpace) {
      horizontal = "right";
    } else if (!needsRightSpace) {
      horizontal = "left";
    } else {
      horizontal = availableLeft >= availableRight ? "right" : "left";
    }

    let vertical: PopoverPlacement["vertical"];
    if (!needsBottomSpace) {
      vertical = "bottom";
    } else if (!needsTopSpace) {
      vertical = "top";
    } else {
      vertical = availableBelow >= availableAbove ? "bottom" : "top";
    }

    setPopoverPlacement({ horizontal, vertical });
  }, [activeControl]);

  React.useLayoutEffect(() => {
    if (activeControl) {
      updatePopoverPlacement();
    }
  }, [activeControl, controlPlacement, updatePopoverPlacement]);

  React.useEffect(() => {
    if (!settingsOpen) {
      return;
    }
    recalcSettingsPosition();
    const handleResize = () => recalcSettingsPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settingsOpen, recalcSettingsPosition]);

  const getPixelPosition = React.useCallback(() => {
    if (xPercent !== undefined && yPercent !== undefined) {
      const availableWidth = window.innerWidth - (width || 0);
      const availableHeight = window.innerHeight - (height || 0);

      const pixelX = Math.max(0, Math.min((xPercent / 100) * availableWidth, availableWidth));
      const pixelY = Math.max(0, Math.min((yPercent / 100) * availableHeight, availableHeight));

      return { x: pixelX, y: pixelY };
    }

    return { x: x || 0, y: y || 0 };
  }, [x, y, xPercent, yPercent, width, height]);

  React.useEffect(() => {
    if (
      position === "free" &&
      xPercent === undefined &&
      yPercent === undefined &&
      x !== undefined &&
      y !== undefined &&
      width !== null &&
      height !== null
    ) {
      const availableWidth = window.innerWidth - width;
      const availableHeight = window.innerHeight - height;
      const newXPercent = availableWidth > 0 ? (x / availableWidth) * 100 : 0;
      const newYPercent = availableHeight > 0 ? (y / availableHeight) * 100 : 0;

      setWidgetDisplay(id, {
        xPercent: newXPercent,
        yPercent: newYPercent,
      });
    }
  }, [position, x, y, xPercent, yPercent, id, width, height]);

  React.useEffect(() => {
    if (position === "free") {
      const pixelPos = getPixelPosition();
      setOffset(pixelPos);
    }
  }, [position, getPixelPosition]);

  React.useEffect(() => {
    if (position === "free" && widgetRef.current && (!width || !height)) {
      setWidth(widgetRef.current.offsetWidth);
      setHeight(widgetRef.current.offsetHeight);
    }
  }, [position, width, height]);

  const handleDragStart = (event: React.MouseEvent) => {
    if (!widgetRef.current || !isEditingPosition || position !== "free") return;

    event.preventDefault();
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleDrag = React.useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;
      const newX = event.clientX - dragStart.x;
      const newY = event.clientY - dragStart.y;

      const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - (width || 0)));
      const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - (height || 0)));

      const availableWidth = window.innerWidth - (width || 0);
      const availableHeight = window.innerHeight - (height || 0);
      const newXPercent = availableWidth > 0 ? (constrainedX / availableWidth) * 100 : 0;
      const newYPercent = availableHeight > 0 ? (constrainedY / availableHeight) * 100 : 0;

      setOffset({ x: constrainedX, y: constrainedY });
      setWidgetDisplay(id, {
        position: "free",
        x: constrainedX,
        y: constrainedY,
        xPercent: newXPercent,
        yPercent: newYPercent,
      });
    },
    [isDragging, dragStart, id, width, height],
  );

  React.useEffect(() => {
    if (!isDragging) return;

    document.addEventListener("mousemove", handleDrag);
    const stopDragging = () => setIsDragging(false);
    document.addEventListener("mouseup", stopDragging);

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging, handleDrag]);

  React.useEffect(() => {
    const handleResize = () => {
      if (position === "free") {
        const pixelPos = getPixelPosition();
        setOffset(pixelPos);
      }
      updateControlPlacement();
      if (activeControl) {
        updatePopoverPlacement();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, getPixelPosition, activeControl, updateControlPlacement, updatePopoverPlacement]);

  const styles: React.CSSProperties = {
    position: position === "free" ? "absolute" : "relative",
    color: colour,
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    fontStyle,
    textDecoration,
    zIndex: activeControl ? 1500 : undefined,
    ...(position === "free" && {
      left: `${offset.x}px`,
      top: `${offset.y}px`,
      width: width ? `${width}px` : "auto",
      whiteSpace: "nowrap",
      ...(isEditingPosition && {
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }),
    }),
  };

  const contentTransformStyle: React.CSSProperties = {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: "center",
  };

  const controlPositionStyle = React.useMemo<React.CSSProperties>(() => {
    const gap = "0.15rem";
    const style: React.CSSProperties = {};

    if (controlPlacement.vertical === "top") {
      style.bottom = `calc(100% + ${gap})`;
      style.top = "auto";
    } else {
      style.top = `calc(100% + ${gap})`;
      style.bottom = "auto";
    }

    if (controlPlacement.horizontal === "left") {
      style.left = "0";
      style.right = "auto";
    } else {
      style.right = "0";
      style.left = "auto";
    }

    return style;
  }, [controlPlacement]);

  const popoverPositionStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};
    if (popoverPlacement.vertical === "bottom") {
      style.top = "calc(100% + 0.5rem)";
      style.bottom = "auto";
    } else {
      style.bottom = "calc(100% + 0.5rem)";
      style.top = "auto";
    }

    if (popoverPlacement.horizontal === "right") {
      style.right = 0;
      style.left = "auto";
    } else {
      style.left = 0;
      style.right = "auto";
    }

    return style;
  }, [popoverPlacement]);

  const handleSave = () => {
    setIsDragging(false);

    const availableWidth = window.innerWidth - (width || 0);
    const availableHeight = window.innerHeight - (height || 0);
    const newXPercent = availableWidth > 0 ? (offset.x / availableWidth) * 100 : 0;
    const newYPercent = availableHeight > 0 ? (offset.y / availableHeight) * 100 : 0;

    setWidgetDisplay(id, {
      position: "free",
      x: offset.x,
      y: offset.y,
      xPercent: newXPercent,
      yPercent: newYPercent,
      isEditingPosition: false,
    });
  };

  const openSettingsPanel = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.stopPropagation();
    }
    if (isTextWidgetKey && config.settingsComponent) {
      openTextEditor(id, widgetKey);
      return;
    }
    const hasWidgetSpecificSettings =
      !isCodeWidget && !isTextWidgetKey && Boolean(config.settingsComponent);
    setSettingsMode(hasWidgetSpecificSettings ? "widget" : "layout");
    recalcSettingsPosition();
    setSettingsOpen(true);
  };

  const openFontSettings = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setFontSettingsOpen(true);
  };

  const handleFontSave = (next: Partial<WidgetDisplay>) => {
    setWidgetDisplay(id, next);
    setFontSettingsOpen(false);
  };

  const toggleControl = (control: ControlName) => {
    setActiveControl((current) => (current === control ? null : control));
  };

  const handleStartReposition = () => {
    setWidgetDisplay(id, {
      position: "free",
      isEditingPosition: true,
    });
  };

  const handleScaleChange = (value: number) => {
    const clamped = Math.max(0.6, Math.min(1.8, value));
    setLocalScale(clamped);
    setWidgetDisplay(id, { scale: clamped });
  };

  const handleRotationChange = (value: number) => {
    const normalized = Math.max(-180, Math.min(180, value));
    setLocalRotation(normalized);
    setWidgetDisplay(id, { rotation: normalized });
  };

  const openRotationInput = () => {
    setRotationInput(Math.round(localRotation).toString());
    setRotationInputActive(true);
  };

  const commitRotationInput = () => {
    const parsed = parseFloat(rotationInput);
    if (Number.isNaN(parsed)) {
      setRotationInput(Math.round(localRotation).toString());
      setRotationInputActive(false);
      return;
    }
    handleRotationChange(parsed);
    setRotationInputActive(false);
  };

  const cancelRotationInput = () => {
    setRotationInput(Math.round(localRotation).toString());
    setRotationInputActive(false);
  };

  const handleSnap = (next: WidgetPosition) => {
    setWidgetDisplay(id, {
      position: next,
      isEditingPosition: false,
    });
    setActiveControl(null);
  };

  const handleDelete = () => {
    if (window.confirm("Remove this widget?")) {
      removeWidget(id);
      setSettingsOpen(false);
      setFontSettingsOpen(false);
    }
  };

  let classNames = `Widget ${fontWeight ? "weight-override" : ""}`;
  if (customClass) {
    classNames += ` ${customClass}`;
  }
  if (isEditingPosition) {
    classNames += " drag-selected";
  }

  const renderContent = () => {
    const outlineStyle = textOutline ? (textOutlineStyle ?? "basic") : null;
    const popoversEnabled = !isEditingPosition;

    return (
      <div
        ref={widgetRef}
        className={classNames}
        style={styles}
        onMouseDown={handleDragStart}
      >
        <div
          className={`widget-controls ${activeControl ? "menu-active" : ""} ${
            isEditingPosition ? "editing" : ""
          }`}
          data-widget-control
          ref={quickMenuRef}
          style={controlPositionStyle}
        >
          {isEditingPosition ? (
            <button
              type="button"
              className="widget-settings-trigger"
              data-widget-control
              aria-label="Save position"
              title="Save position"
              onClick={(event) => {
                event.stopPropagation();
                handleSave();
              }}
            >
              <Icon icon="feather:check" data-widget-control />
            </button>
          ) : (
            <button
              type="button"
              className="widget-settings-trigger"
              data-widget-control
              aria-label="Enter freeform mode"
              title="Reposition"
              onClick={(event) => {
                event.stopPropagation();
                handleStartReposition();
              }}
            >
              <Icon icon="feather:crosshair" data-widget-control />
            </button>
          )}
          <button
            type="button"
            className="widget-settings-trigger"
            data-widget-control
            aria-label="Adjust scale"
            title="Scale"
            onClick={(event) => {
              event.stopPropagation();
              toggleControl("scale");
            }}
          >
            <Icon icon="feather:maximize-2" data-widget-control />
          </button>
          <button
            type="button"
            className="widget-settings-trigger"
            data-widget-control
            aria-label="Adjust rotation"
            title="Rotation"
            onClick={(event) => {
              event.stopPropagation();
              toggleControl("rotate");
            }}
          >
            <Icon icon="feather:rotate-cw" data-widget-control />
          </button>
          <button
            type="button"
            className="widget-settings-trigger"
            data-widget-control
            aria-label="Snap alignment"
            title="Snap alignment"
            onClick={(event) => {
              event.stopPropagation();
              toggleControl("snap");
            }}
          >
            <Icon icon="feather:grid" data-widget-control />
          </button>
          <button
            type="button"
            className="widget-settings-trigger"
            data-widget-control
            aria-label="Font settings"
            title="Font settings"
            onClick={openFontSettings}
          >
            <Icon icon="feather:type" data-widget-control />
          </button>
          <button
            type="button"
            className="widget-settings-trigger"
            data-widget-control
            aria-label="Widget settings"
            title="Widget settings"
            onClick={openSettingsPanel}
          >
            <Icon icon="feather:sliders" data-widget-control />
          </button>
          {isCodeWidget ? (
            <button
              type="button"
              className="widget-settings-trigger"
              data-widget-control
              aria-label="Edit custom code"
              title="Edit custom code"
              onClick={(event) => {
                event.stopPropagation();
                openCodeEditor(id, widgetKey);
              }}
            >
              <Icon icon="feather:file-text" data-widget-control />
            </button>
          ) : null}
          <button
            type="button"
            className="widget-settings-trigger danger"
            data-widget-control
            aria-label="Remove widget"
            title="Delete"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
          >
            <Icon icon="feather:trash-2" data-widget-control />
          </button>

          {activeControl === "scale" && popoversEnabled && (
            <div
              className="widget-control-popover popover-scale"
              data-widget-control
              style={popoverPositionStyle}
            >
              <div className="popover-header">
                <span>Scale</span>
                <span>{Math.round(localScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={localScale}
                onChange={(event) => handleScaleChange(parseFloat(event.target.value))}
              />
            </div>
          )}

          {activeControl === "rotate" && popoversEnabled && (
            <div
              className="widget-control-popover popover-rotate"
              data-widget-control
              style={popoverPositionStyle}
            >
              <div className="popover-header">
                <span>Rotation</span>
                {isRotationInputActive ? (
                  <input
                    type="number"
                    className="popover-value-input"
                    min="-180"
                    max="180"
                    value={rotationInput}
                    onChange={(event) => setRotationInput(event.target.value)}
                    onBlur={commitRotationInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitRotationInput();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        cancelRotationInput();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="popover-value-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openRotationInput();
                    }}
                    title="Click to enter a precise angle"
                  >
                    {Math.round(localRotation)}°
                  </button>
                )}
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={localRotation}
                onChange={(event) => handleRotationChange(parseFloat(event.target.value))}
              />
            </div>
          )}

          {activeControl === "snap" && popoversEnabled && (
            <div
              className="widget-control-popover popover-snap"
              data-widget-control
              style={popoverPositionStyle}
            >
              <div className="popover-header">
                <span>Snap Alignment</span>
              </div>
              <div className="quick-align-grid">
                {quickAlignOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`holo-chip ${position === option.value ? "active" : ""}`}
                    aria-label={option.label}
                    title={option.label}
                    data-position={option.value}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSnap(option.value);
                    }}
                  >
                    <Icon icon={option.icon} aria-hidden="true" />
                    <span className="sr-only">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="widget-content" style={contentTransformStyle}>
          {textOutline && outlineStyle === "basic" ? (
            <div
              style={{
                textShadow: `
                -1px -1px 0 ${textOutlineColor},
                1px -1px 0 ${textOutlineColor},
                -1px 1px 0 ${textOutlineColor},
                1px 1px 0 ${textOutlineColor}
              `,
              }}
            >
              {children}
            </div>
          ) : textOutline && outlineStyle === "advanced" ? (
            <>
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  color: textOutlineColor,
                  zIndex: 0,
                  WebkitTextStroke: `${textOutlineSize * 2}px ${textOutlineColor}`,
                }}
              >
                {children}
              </span>
              <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {isEditingPosition && <FloatingSaveButton onClick={handleSave} />}
      <WidgetSettings
        widgetName={widgetName}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDelete={handleDelete}
        onStartReposition={() => {
          setSettingsOpen(false);
          handleStartReposition();
        }}
        onScaleChange={handleScaleChange}
        onQuickAlign={handleSnap}
        scale={localScale}
        currentPosition={position}
        position={settingsPosition}
        mode={settingsMode}
        settingsComponent={config.settingsComponent}
        pluginId={id}
      />
      <WidgetFontSettings
        widgetName={widgetName}
        isOpen={fontSettingsOpen}
        display={displaySnapshot}
        onClose={() => setFontSettingsOpen(false)}
        onSave={handleFontSave}
      />
    </>
  );
};

export default Widget;