import "./Drag.sass";

import { useContext } from "react";

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

  const { dropZoneId, isDragging, dragItemId, dragItemStyle } = context;

  /*
    If the current target drop zone does not match its own id, render nothing.
    This behaviour is overridden, however, if the current dragging item's id matches
    with its id since this implies this dropzone was where the original item came from.

    Trello shows a visual gap when pulling an item out of a list and this replicates that.
  */

  if (dropZoneId !== dropId && !(isDragging && dragItemId === dropId)) {
    return null;
  }

  return (
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
