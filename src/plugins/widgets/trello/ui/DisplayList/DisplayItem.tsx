import React, { useRef } from "react";
import { colourPalette, Item } from "../../types";
import { useDragContext } from "../../contexts/DragContext";

interface DisplayItemProps {
  item: Item;
  listId: string;
}

export default function DisplayItem({ item, listId }: DisplayItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { startDrag, isDragging, dragState } = useDragContext();

  const isThisItemDragging = isDragging && dragState.item?.id === item.id;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (itemRef.current) {
      // Capture pointer for smooth dragging
      itemRef.current.setPointerCapture(e.pointerId);
      startDrag(item, listId, itemRef.current);
    }
  };

  return (
    <div
      ref={itemRef}
      className="display-list-item-content"
      style={{
        opacity: isThisItemDragging ? 0.3 : 1,
        cursor: isThisItemDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
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
    </div>
  );
}
