import React, { useContext } from "react";

import { DragContext } from "./Drag";

interface DraggableItemProps {
  dragId: string;
  dragType: string; // Type category for matching with compatible DropZones
  [key: string]: unknown;
}

export function DraggableItem({
  dragId,
  dragType,
  ...props
}: DraggableItemProps) {
  const context = useContext(DragContext);

  if (!context) {
    console.error("DragItem must be used within Drag component");
    return null;
  }

  const { draggable, dragStart, drag, dragEnd } = context;

  const onDragStart = (e: React.DragEvent) => {
    dragStart(e, dragId, dragType, e.currentTarget as HTMLElement);
  };

  return (
    <div
      onDragStart={onDragStart}
      onDrag={(e: React.DragEvent) => drag(e)}
      draggable={draggable}
      onDragEnd={dragEnd}
      {...props}
    />
  );
}
