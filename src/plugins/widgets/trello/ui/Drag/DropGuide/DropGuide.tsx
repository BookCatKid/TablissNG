import "./style.sass";

import { useContext } from "react";

import { DragContext } from "../Drag";

/**
 * Conditionally renders its children only when dropId matches the
 * currently active DropZone. Used to show a visual indicator
 * that previews where the card will be placed.
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

  const { dropZoneId, dragCardStyle } = context;
  console.log("Current drop zone id ", dropZoneId);
  console.log("self id ", dropId);
  if (dropZoneId !== dropId) {
    return null;
  }

  return (
    <div
      className="drop-guide"
      style={{
        height: `${dragCardStyle?.size.height}px`,
        width: `${dragCardStyle?.size.width}px`,
      }}
      {...props}
    />
  );
}
