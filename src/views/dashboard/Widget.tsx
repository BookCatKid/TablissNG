import React from "react";
import { WidgetDisplay, WidgetPosition } from "../../db/state";
import { setWidgetDisplay } from "../../db/action";
import FloatingSaveButton from "../shared/FloatingSaveButton";
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
}) => {
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [offset, setOffset] = React.useState({ x, y });
  const [width, setWidth] = React.useState<number | null>(null);
  const [height, setHeight] = React.useState<number | null>(null);

  // Calculate pixel position from percentage, accounting for widget dimensions
  const getPixelPosition = React.useCallback(() => {
    if (xPercent !== undefined && yPercent !== undefined) {
      // Calculate available space accounting for widget dimensions
      const availableWidth = window.innerWidth - (width || 0);
      const availableHeight = window.innerHeight - (height || 0);

      // Use percentage of available space to prevent edge misalignment
      const pixelX = Math.max(
        0,
        Math.min((xPercent / 100) * availableWidth, availableWidth),
      );
      const pixelY = Math.max(
        0,
        Math.min((yPercent / 100) * availableHeight, availableHeight),
      );

      return { x: pixelX, y: pixelY };
    }

    // Fall back to pixel coordinates
    return { x: x || 0, y: y || 0 };
  }, [x, y, xPercent, yPercent, width, height]);

  // Migration: Convert existing pixel coordinates to percentages if needed
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
      // This is an existing widget without percentage coordinates, migrate it
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

  // Update offset when window size changes or percentage changes
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

  const handleDragStart = (e: React.MouseEvent) => {
    if (!widgetRef.current || !isEditingPosition || position !== "free") return;

    e.preventDefault();
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDrag = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain to viewport bounds
      const constrainedX = Math.max(
        0,
        Math.min(newX, window.innerWidth - (width || 0)),
      );
      const constrainedY = Math.max(
        0,
        Math.min(newY, window.innerHeight - (height || 0)),
      );

      // Convert pixel coordinates to percentages based on available space
      const availableWidth = window.innerWidth - (width || 0);
      const availableHeight = window.innerHeight - (height || 0);
      const newXPercent =
        availableWidth > 0 ? (constrainedX / availableWidth) * 100 : 0;
      const newYPercent =
        availableHeight > 0 ? (constrainedY / availableHeight) * 100 : 0;

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

  // Handle window resize to maintain relative positioning
  React.useEffect(() => {
    if (position !== "free") return;

    const handleResize = () => {
      const pixelPos = getPixelPosition();
      setOffset(pixelPos);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, getPixelPosition]);

  const parsedFont = parseFontFamilyAndFeatures(fontFamily || "");

  const styles: React.CSSProperties = {
    position: position === "free" ? "absolute" : "relative",
    color: colour,
    fontFamily: parsedFont.family || fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    fontStyle,
    textDecoration,
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    ...parsedFont.style,
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

  const handleSave = () => {
    setIsDragging(false);

    // Convert current pixel position to percentages based on available space
    const availableWidth = window.innerWidth - (width || 0);
    const availableHeight = window.innerHeight - (height || 0);
    const newXPercent =
      availableWidth > 0 ? (offset.x / availableWidth) * 100 : 0;
    const newYPercent =
      availableHeight > 0 ? (offset.y / availableHeight) * 100 : 0;

    setWidgetDisplay(id, {
      position: "free",
      x: offset.x,
      y: offset.y,
      xPercent: newXPercent,
      yPercent: newYPercent,
      isEditingPosition: false,
    });
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
      <div
        ref={widgetRef}
        className={classNames}
        style={styles}
        onMouseDown={handleDragStart}
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
      {isEditingPosition && <FloatingSaveButton onClick={handleSave} />}
    </>
  );
};

export default Widget;
