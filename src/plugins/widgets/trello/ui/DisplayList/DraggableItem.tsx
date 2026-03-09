import React from "react";
import ReactDOM from "react-dom";
import { colourPalette } from "../../types";
import { useDragContext } from "../../contexts/DragContext";

/**
 * Floating drag preview - rendered via portal to document.body
 * Receives position from DragContext
 */
export default function DraggableItem() {
  const { dragState } = useDragContext();

  if (!dragState.item || !dragState.position || !dragState.elementStyle) {
    return null;
  }

  const { item, position, elementStyle } = dragState;

  return ReactDOM.createPortal(
    <div
      className="display-list-item-content dragged-item"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        width: `${elementStyle.size.width}px`,
        height: `${elementStyle.size.height}px`,
        fontSize: `${elementStyle.fontSize}px`,
        pointerEvents: "none",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="labels-container">
        {item.labels.map((label) => (
          <div
            key={label.color}
            style={{
              width: "2.5rem",
              height: "0.26rem",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
              background: colourPalette[label.color],
            }}
          />
        ))}
      </div>
      <span>{item.name}</span>
    </div>,
    document.body,
  );
}
