import React, { useContext } from "react";

import { DragContext } from "./Drag";

interface DraggableCardProps {
  dragId: string;
  dragType: string;
  [key: string]: unknown;
}

export function DraggableCard({
  dragId,
  dragType,
  ...props
}: DraggableCardProps) {
  const context = useContext(DragContext);

  if (!context) {
    console.error("DragCard must be used within Drag component");
    return null;
  }

  const { draggable, dragStart, drag, dragEnd } = context;

  const onDragStart = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    dragStart(e, dragId, dragType, el);
  };

  return (
    <div
      onDragStart={onDragStart}
      onDrag={drag}
      draggable={draggable}
      onDragEnd={dragEnd}
      {...props}
    />
  );
}
