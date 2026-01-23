import React, { useState, useRef } from "react";
import Button from "./Button";

interface Props {
  onClick: () => void;
  children: React.ReactNode;
}

const FloatingButton: React.FC<Props> = ({ onClick, children }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggingRef = useRef(false);

  const [position, setPosition] = useState({
    x: window.innerWidth - 150,
    y: window.innerHeight - 60,
  });

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef(position);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    buttonRef.current.setPointerCapture(e.pointerId);

    const rect = buttonRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    wasDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || !buttonRef.current) return;

    wasDraggingRef.current = true;

    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;

    // Ensure the button stays within viewport bounds
    const buttonWidth = buttonRef.current.offsetWidth;
    const buttonHeight = buttonRef.current.offsetHeight;
    const maxX = window.innerWidth - buttonWidth;
    const maxY = window.innerHeight - buttonHeight;

    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    currentPosRef.current = { x: clampedX, y: clampedY };

    buttonRef.current.style.left = `${clampedX}px`;
    buttonRef.current.style.top = `${clampedY}px`;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || !buttonRef.current) return;

    buttonRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    setPosition(currentPosRef.current);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggingRef.current = false;
      return;
    }
    onClick();
  };

  return (
    <Button
      ref={buttonRef}
      primary
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      {children}
    </Button>
  );
};

export default FloatingButton;
