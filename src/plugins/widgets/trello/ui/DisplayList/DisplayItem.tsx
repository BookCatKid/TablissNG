import React, { useRef } from "react";
import {
  colourPalette,
  RealOrSkeletonItem,
  isItem,
  Item,
  DraggedItemStyle,
} from "../../types";
import { useDragContext } from "../../contexts/DragContext";
import SkeletonItem from "./SkeletonItem";

interface DisplayItemProps {
  item: RealOrSkeletonItem;
  listId: string;
  onDragStart: (
    item: Item,
    sourceItemIndex: number,
    sourceListId: string,
    style: DraggedItemStyle,
  ) => void;
}

export default function DisplayItem({
  item,
  listId,
  onDragStart,
}: DisplayItemProps) {
  const typeIsItem = isItem(item);

  const itemRef = useRef<HTMLDivElement | null>(null);
  const { registerItemRef, startDrag, isDragging, dragState } =
    useDragContext();

  const itemDragging =
    dragState && isDragging && typeIsItem && dragState.item.id === item.id;

  const setRef = (element: HTMLDivElement) => {
    if (element && typeIsItem) {
      registerItemRef(listId, element, item);
    }
    itemRef.current = element;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (itemRef.current && typeIsItem) {
      // Capture pointer for smooth dragging
      itemRef.current.setPointerCapture(e.pointerId);
      startDrag(item, listId, itemRef.current, onDragStart);
    }
  };

  return !typeIsItem ? (
    <SkeletonItem width={100} height={60} />
  ) : (
    <div
      ref={setRef}
      className="display-list-item-content"
      style={{
        opacity: itemDragging ? 0.3 : 1,
        cursor: itemDragging ? "grabbing" : "grab",
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
