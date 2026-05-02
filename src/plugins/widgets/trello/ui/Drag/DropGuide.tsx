import "./Drag.sass";

import React, { useContext } from "react";

import { DragContext } from "./Drag";

/**
 * Conditionally renders its children only when dropId matches the
 * currently active DropZone. Used to show a visual indicator
 * that previews where the item will be placed.
 */
interface DropGuideProps {
  dropId: string | null;
  [key: string]: unknown;
}

export function DropGuide({ dropId, ...props }: DropGuideProps) {
  const context = useContext(DragContext);

  if (!context) {
    return null;
  }

  const { dropZoneId, dragItemStyle } = context;

  return dropZoneId !== dropId ? null : (
    <div
      className="drop-guide"
      style={{
        height: `${dragItemStyle?.size.height}px`,
        width: `${dragItemStyle?.size.width}px`,
      }}
      {...props}
    />
  );
}
