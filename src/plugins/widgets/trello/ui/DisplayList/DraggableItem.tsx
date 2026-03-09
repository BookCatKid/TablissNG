import React, { useState } from "react";
import ReactDOM from "react-dom";
import { colourPalette, Item } from "../../types";
import { useRef } from "react";
import Moveable from "react-moveable";

interface DraggableItemProps {
  item: Item;
  initialPosition: { x: number; y: number };
}

/**
 * Floating, draggable list item. Rendered outside of DisplayList's container so it can be dragged anywherekjA
 */
export default function DraggableItem({
  item,
  initialPosition,
}: DraggableItemProps) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  return ReactDOM.createPortal(
    <>
      <div
        ref={setTarget}
        className="display-list-item-content"
        style={{
          position: "fixed",
          left: initialPosition.x,
          top: initialPosition.y,
          zIndex: 9999,
          width: "200px",
          pointerEvents: "all",
        }}
      >
        {/* Trello card tags */}
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
      </div>

      {target && (
        <Moveable
          target={target}
          draggable={true}
          onDrag={({ target, left, top }) => {
            console.log(left, top);
            target.style.left = `${left}px`;
            target.style.top = `${top}px`;
          }}
        />
      )}
    </>,
    document.querySelector(".display-list-container")!, // Assumes the display list container will always be present
    // document.body
  );
}
