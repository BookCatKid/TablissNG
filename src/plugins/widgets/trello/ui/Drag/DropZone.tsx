import React, { useContext } from "react";

import { DragContext } from "./Drag";

interface DropZoneProps {
  dropId: string;
  dropType: string; // Type category — only DragCards with matching dragType can be dropped here
  remember?: boolean; // If true, dropId persists even after the pointer leaves this zone
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function DropZone({
  dropId,
  dropType,
  remember,
  style,
  children,
  ...props
}: DropZoneProps) {
  const context = useContext(DragContext);

  if (!context) {
    console.error("DropZone must be used within Drag component");
    return null;
  }

  const {
    dragCardId: dragCard,
    dragType: contextDragType,
    setDropZoneId: setDrop,
    dropZoneId: drop,
    onDrop,
  } = context;

  // Required to make this element a valid drop target
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    return false;
  }

  // Clears the active drop zone unless remember is set
  function handleLeave() {
    if (!remember) {
      setDrop(null);
    }
  }

  return (
    <div
      onDragEnter={(e: React.DragEvent) => {
        e.preventDefault();
        // Only register as active drop zone if types match and something is being dragged
        return dragCard && dropType === contextDragType && setDrop(dropId);
      }}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      style={{ position: "relative", ...style }}
      {...props}
    >
      {children}
      {/* Invisible overlay that tracks pointer leaving; clears drop zone when it
      does */}
      {drop === dropId && (
        <div
          style={{ position: "absolute", inset: "0px" }}
          onDragLeave={handleLeave}
        ></div>
      )}
    </div>
  );
}
