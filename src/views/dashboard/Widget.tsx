import { Icon } from "@iconify/react";
import {
  type CSSProperties,
  type FC,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { UiContext } from "../../contexts/ui";
import {
  duplicateWidget,
  removeWidget,
  setWidgetDisplay,
} from "../../db/action";
import { db, WidgetDisplay, WidgetPosition } from "../../db/state";
import { useKey } from "../../lib/db/react";
import { pluginMessages } from "../../locales/messages";
import { getConfig } from "../../plugins";
import { isCustomCodeWidget } from "../../plugins/widgets/customCode";
import { isTextWidget } from "../../plugins/widgets/textWidgets";
import { parseFontFamilyAndFeatures } from "../../utils";
import FloatingButton from "../shared/FloatingButton";
import MoveableWrapper from "./MoveableWrapper";
import WidgetFontSettings from "./WidgetFontSettings";
import WidgetSettings from "./WidgetSettings";

interface WidgetProps extends WidgetDisplay {
  id: string;
  widgetKey: string;
  children: ReactNode;
}

const Widget: FC<WidgetProps> = ({
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
  useAccentColor,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [accent] = useKey(db, "accent") || ["#3498db"];
  const { openCodeEditor, openTextEditor } = useContext(UiContext);
  const intl = useIntl();
  const config = getConfig(widgetKey);
  const widgetName = intl.formatMessage(config.name);

  const canOpenTextEditor = isTextWidget(widgetKey);
  const canOpenCodeEditor = isCustomCodeWidget(widgetKey);
  const canOpenWidgetSettings = Boolean(config.settingsComponent);
  const hasExpandedControls = true;

  const getPixelPosition = useCallback(() => {
    if (xPercent !== undefined && yPercent !== undefined && widgetRef.current) {
      const travelX = window.innerWidth - widgetRef.current.offsetWidth;
      const travelY = window.innerHeight - widgetRef.current.offsetHeight;
      const pixelX = (xPercent / 100) * travelX;
      const pixelY = (yPercent / 100) * travelY;
      return { x: pixelX, y: pixelY };
    }

    return { x: x || 0, y: y || 0 };
  }, [x, y, xPercent, yPercent]);

  const [offset, setOffset] = useState(() => ({ x: x || 0, y: y || 0 }));
  const [isWidgetHovered, setIsWidgetHovered] = useState(false);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [settingsMode, setSettingsMode] = useState<"layout" | "widget" | null>(
    null,
  );
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [controlsPosition, setControlsPosition] =
    useState<CSSProperties | null>(null);
  const [widgetSettingsPosition, setWidgetSettingsPosition] = useState({
    x: 24,
    y: 24,
  });
  const isControlsVisible =
    isEditingPosition ||
    isWidgetHovered ||
    isControlsHovered ||
    isControlsExpanded ||
    settingsMode !== null ||
    isFontSettingsOpen;

  const clearHideControlsTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimer();
    hideControlsTimerRef.current = setTimeout(() => {
      setIsWidgetHovered(false);
      setIsControlsHovered(false);
      setIsControlsExpanded(false);
    }, 350);
  }, [clearHideControlsTimer]);

  const updateControlsPosition = useCallback(() => {
    if (!widgetRef.current) {
      return;
    }

    const widgetRect = widgetRef.current.getBoundingClientRect();
    const controlsRect = controlsRef.current?.getBoundingClientRect();
    const controlsWidth = controlsRect?.width ?? 104;
    const controlsHeight = controlsRect?.height ?? 40;
    const padding = 8;
    const gap = 8;

    const preferredTop = widgetRect.top - controlsHeight - gap;
    const top = preferredTop < padding ? widgetRect.bottom + gap : preferredTop;
    const left = widgetRect.right - controlsWidth;
    const maxLeft = window.innerWidth - controlsWidth - padding;
    const maxTop = window.innerHeight - controlsHeight - padding;

    setControlsPosition({
      position: "fixed",
      top: `${Math.min(Math.max(top, padding), maxTop)}px`,
      left: `${Math.min(Math.max(left, padding), maxLeft)}px`,
      right: "auto",
    });
  }, []);

  useEffect(() => {
    if (
      position === "free" &&
      (xPercent === undefined || yPercent === undefined) &&
      x !== undefined &&
      y !== undefined
    ) {
      if (widgetRef.current) {
        const travelX = window.innerWidth - widgetRef.current.offsetWidth;
        const travelY = window.innerHeight - widgetRef.current.offsetHeight;
        const newXPercent = travelX !== 0 ? (x / travelX) * 100 : 0;
        const newYPercent = travelY !== 0 ? (y / travelY) * 100 : 0;

        setWidgetDisplay(id, {
          xPercent: newXPercent,
          yPercent: newYPercent,
        });
      }
    }
  }, [position, x, y, xPercent, yPercent, id]);

  useEffect(() => {
    updateControlsPosition();
  }, [
    isControlsExpanded,
    isControlsVisible,
    offset,
    rotation,
    scale,
    updateControlsPosition,
  ]);

  useEffect(() => {
    const handleResize = () => updateControlsPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateControlsPosition]);

  useEffect(() => {
    return () => clearHideControlsTimer();
  }, [clearHideControlsTimer]);

  useEffect(() => {
    if (position === "free") {
      const pos = getPixelPosition();
      setOffset(pos);
    }
  }, [position, getPixelPosition]);

  useEffect(() => {
    if (position !== "free" || !widgetRef.current) return;

    const handleResize = () => {
      setOffset(getPixelPosition());
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(widgetRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [position, getPixelPosition]);

  const parsedFont = parseFontFamilyAndFeatures(fontFamily || "");

  const handleTransformEnd = useCallback(
    (transform: {
      x?: number;
      y?: number;
      xPercent?: number;
      yPercent?: number;
      scale?: number;
      rotation?: number;
    }) => {
      setWidgetDisplay(id, {
        position: "free",
        ...transform,
      });

      if (transform.x !== undefined && transform.y !== undefined) {
        setOffset({ x: transform.x, y: transform.y });
      }
    },
    [id],
  );

  const handleSave = () => {
    if (widgetRef.current) {
      const travelX = window.innerWidth - widgetRef.current.offsetWidth;
      const travelY = window.innerHeight - widgetRef.current.offsetHeight;
      const newXPercent = travelX !== 0 ? (offset.x / travelX) * 100 : 0;
      const newYPercent = travelY !== 0 ? (offset.y / travelY) * 100 : 0;

      setWidgetDisplay(id, {
        position: "free",
        x: offset.x,
        y: offset.y,
        xPercent: newXPercent,
        yPercent: newYPercent,
        isEditingPosition: false,
      });
    } else {
      setWidgetDisplay(id, { isEditingPosition: false });
    }
  };

  const handleToggleReposition = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isEditingPosition) {
      handleSave();
      return;
    }

    setWidgetDisplay(id, {
      position: "free",
      isEditingPosition: true,
    });
  };

  const handleOpenTextEditor = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openTextEditor(id, widgetKey);
  };

  const handleOpenCodeEditor = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openCodeEditor(id, widgetKey);
  };

  const handleToggleControlsExpanded = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    clearHideControlsTimer();
    setIsControlsExpanded((current) => !current);
  };

  const setSettingsPositionFromControls = () => {
    clearHideControlsTimer();
    const rect = controlsRef.current?.getBoundingClientRect();
    setWidgetSettingsPosition({
      x: rect ? rect.left : 24,
      y: rect ? rect.bottom + 8 : 24,
    });
  };

  const handleOpenWidgetSettings = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSettingsPositionFromControls();
    setIsControlsExpanded(false);
    setSettingsMode("widget");
  };

  const handleOpenFontSettings = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    clearHideControlsTimer();
    setIsControlsExpanded(false);
    setIsFontSettingsOpen(true);
  };

  const handleRemoveWidget = () => {
    const shouldRemove = window.confirm(`Remove ${widgetName}?`);
    if (!shouldRemove) {
      return;
    }

    removeWidget(id);
  };

  const handleRemoveWidgetClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleRemoveWidget();
  };

  const handleDuplicateWidget = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    duplicateWidget(id);
    setIsControlsExpanded(false);
  };

  const handleStartRepositionFromSettings = () => {
    setSettingsMode(null);
    setWidgetDisplay(id, {
      position: "free",
      isEditingPosition: true,
    });
  };

  const handleScaleChange = (value: number) => {
    setWidgetDisplay(id, { scale: value });
  };

  const handleQuickAlign = (nextPosition: WidgetPosition) => {
    setWidgetDisplay(id, {
      position: nextPosition,
      isEditingPosition: false,
    });
  };

  const transformOriginMap: Record<string, string> = {
    topLeft: "top left",
    topCentre: "top center",
    topRight: "top right",
    middleLeft: "center left",
    middleCentre: "center center",
    middleRight: "center right",
    bottomLeft: "bottom left",
    bottomCentre: "bottom center",
    bottomRight: "bottom right",
    free: "center center",
  };

  const styles: CSSProperties = {
    position: position === "free" ? "absolute" : "relative",
    color: useAccentColor ? accent : colour,
    fontFamily: parsedFont.family || fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    fontStyle,
    textDecoration,
    ...parsedFont.style,
    transform: isEditingPosition
      ? undefined
      : `scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: transformOriginMap[position] || "center center",
    ...(position === "free" && {
      left: `${offset.x}px`,
      top: `${offset.y}px`,
      display: "inline-block",
      whiteSpace: "nowrap",
    }),
  };

  const display: WidgetDisplay = {
    colour,
    fontFamily,
    fontSize,
    scale,
    rotation,
    textOutline,
    textOutlineStyle,
    textOutlineSize,
    textOutlineColor,
    fontWeight,
    fontStyle,
    textDecoration,
    position,
    x,
    y,
    xPercent,
    yPercent,
    isEditingPosition,
    customClass,
    useAccentColor,
  };

  let classNames = `Widget ${fontWeight ? "weight-override" : ""}`;

  if (customClass) {
    classNames += ` ${customClass}`;
  }

  if (isEditingPosition) {
    classNames += " drag-selected";
  }

  const renderControls = () => {
    if (!isControlsVisible || typeof document === "undefined") {
      return null;
    }

    return createPortal(
      <div
        ref={controlsRef}
        className="widget-controls widget-controls--floating is-visible"
        style={controlsPosition ?? { top: "-2.5rem", right: 0 }}
        onMouseEnter={updateControlsPosition}
        onPointerEnter={() => {
          clearHideControlsTimer();
          setIsControlsHovered(true);
        }}
        onPointerLeave={scheduleHideControls}
      >
        <button
          type="button"
          className="widget-settings-trigger"
          aria-label={isEditingPosition ? "Place widget" : "Reposition widget"}
          title={isEditingPosition ? "Place widget" : "Reposition"}
          onClick={handleToggleReposition}
        >
          <Icon
            icon={isEditingPosition ? "feather:check" : "feather:crosshair"}
          />
        </button>

        {hasExpandedControls && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label={
              isControlsExpanded
                ? "Collapse widget controls"
                : "Expand widget controls"
            }
            title={isControlsExpanded ? "Collapse controls" : "More controls"}
            aria-expanded={isControlsExpanded}
            onClick={handleToggleControlsExpanded}
          >
            <Icon
              icon={
                isControlsExpanded
                  ? "feather:chevron-left"
                  : "feather:chevron-right"
              }
            />
          </button>
        )}

        {isControlsExpanded && canOpenWidgetSettings && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label="Open widget settings"
            title="Widget settings"
            onClick={handleOpenWidgetSettings}
          >
            <Icon icon="feather:settings" />
          </button>
        )}

        {isControlsExpanded && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label="Open font settings"
            title="Font settings"
            onClick={handleOpenFontSettings}
          >
            <Icon icon="feather:type" />
          </button>
        )}

        {isControlsExpanded && canOpenTextEditor && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label="Edit text"
            title="Edit text"
            onClick={handleOpenTextEditor}
          >
            <Icon icon="feather:file-text" />
          </button>
        )}

        {isControlsExpanded && canOpenCodeEditor && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label="Edit code"
            title="Edit code"
            onClick={handleOpenCodeEditor}
          >
            <Icon icon="feather:code" />
          </button>
        )}

        {isControlsExpanded && (
          <button
            type="button"
            className="widget-settings-trigger"
            aria-label="Duplicate widget"
            title="Duplicate"
            onClick={handleDuplicateWidget}
          >
            <Icon icon="feather:copy" />
          </button>
        )}

        {isControlsExpanded && (
          <button
            type="button"
            className="widget-settings-trigger danger"
            aria-label="Remove widget"
            title="Remove"
            onClick={handleRemoveWidgetClick}
          >
            <Icon icon="feather:trash-2" />
          </button>
        )}
      </div>,
      document.body,
    );
  };

  const renderContent = () => {
    const outlineStyle = textOutline ? (textOutlineStyle ?? "basic") : null;

    return (
      <div
        ref={widgetRef}
        className={classNames}
        style={styles}
        onPointerEnter={() => {
          clearHideControlsTimer();
          setIsWidgetHovered(true);
        }}
        onPointerLeave={scheduleHideControls}
      >
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
    );
  };

  return (
    <>
      {renderContent()}
      {renderControls()}
      <WidgetSettings
        widgetName={widgetName}
        isOpen={settingsMode !== null}
        onClose={() => setSettingsMode(null)}
        onDelete={handleRemoveWidget}
        onStartReposition={handleStartRepositionFromSettings}
        onScaleChange={handleScaleChange}
        onQuickAlign={handleQuickAlign}
        scale={scale}
        currentPosition={position}
        position={widgetSettingsPosition}
        mode={settingsMode ?? "layout"}
        settingsComponent={config.settingsComponent}
        pluginId={id}
        onPositionChange={setWidgetSettingsPosition}
      />
      <WidgetFontSettings
        widgetName={widgetName}
        isOpen={isFontSettingsOpen}
        display={display}
        onClose={() => setIsFontSettingsOpen(false)}
        onSave={(next) => setWidgetDisplay(id, next)}
      />
      {position === "free" && isEditingPosition && (
        <MoveableWrapper
          targetRef={widgetRef}
          isEditing={isEditingPosition}
          scale={scale}
          rotation={rotation}
          x={offset.x}
          y={offset.y}
          onTransformEnd={handleTransformEnd}
        />
      )}
      {isEditingPosition && (
        <FloatingButton onClick={handleSave}>
          <Icon
            icon="feather:check"
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          <FormattedMessage {...pluginMessages.freeMoveSave} />
        </FloatingButton>
      )}
    </>
  );
};

export default Widget;
