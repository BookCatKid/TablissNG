import React, { useContext } from "react";

import { DragContext } from "./Drag";
import DropZone from "./DropZone";

interface DoubleDropZoneProps {
  dropType: string;
  prevId: string; // dropId for the first half (e.g. "before" or "top")
  nextId: string; // dropId for the second half (e.g. "after" or "bottom")
  split?: "x" | "y"; // Split direction: "y" for top/bottom, "x" for left/right

  // DropZone props
  remember?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Renders two half-size DropZones overlaid on top of children.
 * Only visible while a compatible drag is in progress.
 * Useful for insert-before / insert-after behaviour (eg moving a card above or below its neighbour)
 */
function DoubleDropZone({
  dropType,
  prevId,
  nextId,
  split = "y",
  remember,
  children,
  ...props
}: DoubleDropZoneProps) {
  const context = useContext(DragContext);

  if (!context) {
    return null;
  }

  const { dragType, isDragging } = context;
  return (
    <div style={{ position: "absolute", inset: "0px" }} {...props}>
      {children}
      {dragType === dropType && isDragging && (
        <div
          style={{
            position: "absolute",
            inset: "0px",
            display: "flex",
            flexDirection: split === "x" ? "row" : "column",
          }}
        >
          <DropZone
            dropId={prevId}
            style={{ width: "100%", height: "100%" }}
            dropType={dropType}
            remember={remember}
          />
          <DropZone
            dropId={nextId}
            style={{ width: "100%", height: "100%" }}
            dropType={dropType}
            remember={remember}
          />
        </div>
      )}
    </div>
  );
}

export default DoubleDropZone;
