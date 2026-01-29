import React from "react";
import Moveable from "react-moveable";

interface MoveableWrapperProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  scale: number;
  rotation: number;
  x: number;
  y: number;
  onTransformEnd: (transform: {
    x?: number;
    y?: number;
    xPercent?: number;
    yPercent?: number;
    scale?: number;
    rotation?: number;
  }) => void;
}

const MoveableWrapper: React.FC<MoveableWrapperProps> = ({
  targetRef,
  isEditing,
  scale,
  rotation,
  x,
  y,
  onTransformEnd,
}) => {
  const moveableRef = React.useRef<Moveable>(null);

  // Track cumulative transform during interactions
  const frameRef = React.useRef({
    translate: [0, 0] as [number, number],
    rotate: rotation,
    scale: [scale, scale] as [number, number],
  });

  // Reset frame when editing starts or base transform changes
  React.useEffect(() => {
    frameRef.current = {
      translate: [0, 0],
      rotate: rotation,
      scale: [scale, scale],
    };

    // Apply initial transform to target
    if (targetRef.current) {
      targetRef.current.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    }

    // Update moveable box after style changes
    moveableRef.current?.updateRect();
  }, [isEditing, rotation, scale, x, y, targetRef]);

  // State for screen guidelines to allow snapping to edges/center
  const [guidelines, setGuidelines] = React.useState({
    vertical: [0, Math.round(window.innerWidth / 2), window.innerWidth],
    horizontal: [0, Math.round(window.innerHeight / 2), window.innerHeight],
  });
  const [elementGuidelines, setElementGuidelines] = React.useState<Element[]>(
    [],
  );
  const [isShiftPressed, setIsShiftPressed] = React.useState(false);

  // Handle keys for interaction modifiers
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(e.type === "keydown");
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, []);

  // Update guidelines on resize
  React.useEffect(() => {
    const handleResize = () => {
      setGuidelines({
        vertical: [0, Math.round(window.innerWidth / 2), window.innerWidth],
        horizontal: [0, Math.round(window.innerHeight / 2), window.innerHeight],
      });
    };
    window.addEventListener("resize", handleResize);

    // Find other widgets to snap to
    const otherWidgets = Array.from(
      document.querySelectorAll(".Widget"),
    ).filter((el) => el !== targetRef.current);
    setElementGuidelines(otherWidgets);

    return () => window.removeEventListener("resize", handleResize);
  }, [targetRef, isEditing]);

  // Handle keyboard arrows for precise movement
  React.useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!targetRef.current) return;

      // Don't interfere if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else return;

      e.preventDefault();

      const newX = x + dx;
      const newY = y + dy;

      const el = targetRef.current;
      const travelX = window.innerWidth - el.offsetWidth;
      const travelY = window.innerHeight - el.offsetHeight;

      const xPercent = travelX !== 0 ? (newX / travelX) * 100 : 0;
      const yPercent = travelY !== 0 ? (newY / travelY) * 100 : 0;

      onTransformEnd({
        x: newX,
        y: newY,
        xPercent,
        yPercent,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, x, y, onTransformEnd, targetRef]);

  if (!isEditing || !targetRef.current) {
    return null;
  }

  return (
    <Moveable
      ref={moveableRef}
      target={targetRef}
      container={null}
      // Enable features
      draggable={true}
      rotatable={true}
      scalable={true}
      // Snapping settings
      snappable={!isShiftPressed}
      snapHorizontalThreshold={15}
      snapVerticalThreshold={15}
      verticalGuidelines={guidelines.vertical}
      horizontalGuidelines={guidelines.horizontal}
      elementGuidelines={elementGuidelines}
      isDisplayInnerSnapDigit={true}
      snapDirections={{
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      }}
      elementSnapDirections={{
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      }}
      // Visual settings
      keepRatio={true}
      throttleDrag={1}
      throttleRotate={isShiftPressed ? 15 : 1}
      throttleScale={0.01}
      // Drag events - use translate delta
      onDrag={({ target, translate }) => {
        frameRef.current.translate = translate as [number, number];
        // Apply transform during drag for visual feedback
        target.style.transform = `translate(${translate[0]}px, ${translate[1]}px) rotate(${frameRef.current.rotate}deg) scale(${frameRef.current.scale[0]})`;
      }}
      onDragEnd={({ target }) => {
        // Calculate new absolute position
        const newX = x + frameRef.current.translate[0];
        const newY = y + frameRef.current.translate[1];

        // We DO NOT reset target.style.transform here to avoid flickering.
        // The parent component (Widget.tsx) will re-render with new left/top values,
        // and MoveableWrapper's useEffect will reset the frame and transform.

        // Calculate percentages for responsive positioning using travel space
        const el = target as HTMLElement;
        const travelX = window.innerWidth - el.offsetWidth;
        const travelY = window.innerHeight - el.offsetHeight;

        const xPercent = travelX !== 0 ? (newX / travelX) * 100 : 0;
        const yPercent = travelY !== 0 ? (newY / travelY) * 100 : 0;

        onTransformEnd({
          x: newX,
          y: newY,
          xPercent,
          yPercent,
        });
      }}
      // Rotate events
      onRotate={({ target, rotation: newRotation }) => {
        frameRef.current.rotate = newRotation;
        target.style.transform = `translate(${frameRef.current.translate[0]}px, ${frameRef.current.translate[1]}px) rotate(${newRotation}deg) scale(${frameRef.current.scale[0]})`;
      }}
      onRotateEnd={() => {
        // Normalize rotation to [-180, 180] range to match the settings slider
        const normalizedRotation =
          ((((frameRef.current.rotate + 180) % 360) + 360) % 360) - 180;
        onTransformEnd({
          rotation: normalizedRotation,
        });
      }}
      // Scale events
      onScale={({ target, scale: newScale }) => {
        frameRef.current.scale = newScale as [number, number];
        const uniformScale = (newScale[0] + newScale[1]) / 2;
        target.style.transform = `translate(${frameRef.current.translate[0]}px, ${frameRef.current.translate[1]}px) rotate(${frameRef.current.rotate}deg) scale(${uniformScale})`;
      }}
      onScaleEnd={() => {
        const uniformScale =
          (frameRef.current.scale[0] + frameRef.current.scale[1]) / 2;
        onTransformEnd({
          scale: uniformScale,
        });
      }}
    />
  );
};

export default MoveableWrapper;
