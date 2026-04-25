import React, { useContext } from "react";

import { DragContext } from "./Drag";

interface DragItemProps {
  as?: React.ElementType;
  dragId: string;
  dragType: string; // Type category for matching with compatible DropZones
  [key: string]: any;
}

function DragItem({ as, dragId, dragType, ...props }: DragItemProps) {
  const context = useContext(DragContext);

  if (!context) {
    console.error("DragItem must be used within Drag component");
    return null;
  }

  const { draggable, dragStart, drag, dragEnd } = context;

  const Component = as || "div";
  return (
    <Component
      onDragStart={(e: React.DragEvent) => dragStart(e, dragId, dragType)}
      onDrag={(e: React.DragEvent) => drag(e, dragId, dragType)}
      draggable={draggable}
      onDragEnd={dragEnd}
      {...props}
    />
  );
}

export default DragItem;
