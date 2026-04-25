import React, { useContext } from "react";

import { DragContext } from "./Drag";

/**
 * Conditionally renders its children only when dropId matches the
 * currently active DropZone. Used to show a visual indicator
 * that previews where the item will be placed.
 */
interface DropGuideProps {
  as?: React.ElementType;
  dropId: string | null;
  [key: string]: any;
}

function DropGuide({ as, dropId, ...props }: DropGuideProps) {
  const context = useContext(DragContext);

  if (!context) {
    return null;
  }

  const { dropZoneId } = context;
  const Component = as || "div";
  return dropZoneId === dropId ? <Component {...props} /> : null;
}

export default DropGuide;
