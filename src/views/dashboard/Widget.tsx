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
import { FormattedMessage } from "react-intl";

import { UiContext } from "../../contexts/ui";
import { setWidgetDisplay } from "../../db/action";
import { db, WidgetDisplay } from "../../db/state";
import { useKey } from "../../lib/db/react";
import { pluginMessages } from "../../locales/messages";
import { isCustomCodeWidget } from "../../plugins/widgets/customCode";
import { isTextWidget } from "../../plugins/widgets/textWidgets";
import { parseFontFamilyAndFeatures } from "../../utils";
import FloatingButton from "../shared/FloatingButton";
import MoveableWrapper from "./MoveableWrapper";

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
  const [accent] = useKey(db, "accent") || ["#3498db"];
  const { openCodeEditor, openTextEditor } = useContext(UiContext);

  const canOpenTextEditor = isTextWidget(widgetKey);
  const canOpenCodeEditor = isCustomCodeWidget(widgetKey);

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

  const handleStartReposition = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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

  let classNames = `Widget ${fontWeight ? "weight-override" : ""}`;

  if (customClass) {
    classNames += ` ${customClass}`;
  }

  if (isEditingPosition) {
    classNames += " drag-selected";
  }

  const renderControls = () => {
    if (isEditingPosition) {
      return null;
    }

    return (
      <div className="widget-controls" style={{ top: "-2.5rem", right: 0 }}>
        <button
          type="button"
          className="widget-settings-trigger"
          aria-label="Reposition widget"
          title="Reposition"
          onClick={handleStartReposition}
        >
          <Icon icon="feather:crosshair" />
        </button>

        {canOpenTextEditor && (
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

        {canOpenCodeEditor && (
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
      </div>
    );
  };

  const renderContent = () => {
    const outlineStyle = textOutline ? (textOutlineStyle ?? "basic") : null;

    return (
      <div ref={widgetRef} className={classNames} style={styles}>
        {renderControls()}

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