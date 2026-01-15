import React, { useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Icon } from "@iconify/react";
import "./FloatingSaveButton.css";
import { pluginMessages } from "../../locales/messages";

interface Props {
  onClick: () => void;
}

const FloatingSaveButton: React.FC<Props> = ({ onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [wasDragging, setWasDragging] = React.useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 200,
    y: window.innerHeight - 80,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    e.preventDefault();
    const rect = buttonRef.current.getBoundingClientRect();

    setIsDragging(true);
    setWasDragging(false);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      setWasDragging(true);
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Ensure the button stays within viewport bounds
      const buttonWidth = buttonRef.current?.offsetWidth || 0;
      const buttonHeight = buttonRef.current?.offsetHeight || 0;
      const maxX = window.innerWidth - buttonWidth;
      const maxY = window.innerHeight - buttonHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (wasDragging) {
      e.preventDefault();
      setWasDragging(false);
      return;
    }
    onClick();
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <button
      ref={buttonRef}
      className={`FloatingSaveButton ${isDragging ? "dragging" : ""}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Icon icon="feather:check" />
      <FormattedMessage {...pluginMessages.freeMoveSave} />
    </button>
  );
};

export default FloatingSaveButton;
