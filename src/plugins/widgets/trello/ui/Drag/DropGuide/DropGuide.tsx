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
  const isActive = dropZoneId === dropId;
  return (
    <div
      className="drop-guide"
      style={{
        height: `${isActive ? dragCardStyle?.size.height : 0}px`,
        width: `${isActive ? dragCardStyle?.size.width : 0}px`,
      }}
      {...props}
    />
  );
}
