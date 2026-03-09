import React from "react";
import { WidgetDisplay, db } from "../../db/state";
import { setWidgetDisplay } from "../../db/action";
import { useKey } from "../../lib/db/react";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";
import { pluginMessages } from "../../locales/messages";
import FloatingButton from "../shared/FloatingButton";
import MoveableWrapper from "./MoveableWrapper";
import { parseFontFamilyAndFeatures } from "../../utils";

interface WidgetProps extends WidgetDisplay {
  id: string;
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({
  id,
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
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const [accent] = useKey(db, "accent") || ["#3498db"];

  // Calculate pixel position from percentage
  // Uses "travel space" (viewport size - widget size) for better responsiveness
  const getPixelPosition = React.useCallback(() => {
    if (xPercent !== undefined && yPercent !== undefined && widgetRef.current) {
      const travelX = window.innerWidth - widgetRef.current.offsetWidth;
      const travelY = window.innerHeight - widgetRef.current.offsetHeight;
      const pixelX = (xPercent / 100) * travelX;
      const pixelY = (yPercent / 100) * travelY;
      return { x: pixelX, y: pixelY };
    }
    return { x: x || 0, y: y || 0 };
  }, [x, y, xPercent, yPercent]);

  const [offset, setOffset] = React.useState(() => ({ x: x || 0, y: y || 0 }));

  // Migration: Convert existing pixel coordinates to percentages if needed
  React.useEffect(() => {
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
        setWidgetDisplay(id, { xPercent: newXPercent, yPercent: newYPercent });
      }
    }
  }, [position, x, y, xPercent, yPercent, id]);

  // Update offset when percentage changes or window resizes
  React.useEffect(() => {
    if (position === "free") {
      const pos = getPixelPosition();
      setOffset(pos);
    }
  }, [position, getPixelPosition]);

  // Handle window resize or widget size changes to maintain relative positioning
  React.useEffect(() => {
    if (position !== "free" || !widgetRef.current) return;

    const handleResize = () => {
      setOffset(getPixelPosition());
    };

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Listen for widget's own size changes (e.g. content updates)
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(widgetRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [position, getPixelPosition]);

  const parsedFont = parseFontFamilyAndFeatures(fontFamily || "");

  // Handle transform updates from MoveableWrapper
  const handleTransformEnd = React.useCallback(
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

      // Update local offset if position changed
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

  const styles: React.CSSProperties = {
    position: position === "free" ? "absolute" : "relative",
    color: useAccentColor ? accent : colour,
    fontFamily: parsedFont.family || fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    fontStyle,
    textDecoration,
    ...parsedFont.style,
    // Only apply scale/rotation if NOT editing (moveable handles this during edit)
    transform: isEditingPosition
      ? undefined
      : `scale(${scale}) rotate(${rotation}deg)`,
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

  const renderContent = () => {
    const outlineStyle = textOutline ? (textOutlineStyle ?? "basic") : null;

    return (
      <div ref={widgetRef} className={classNames} style={styles}>
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
