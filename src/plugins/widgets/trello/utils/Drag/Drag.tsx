import { createContext, useEffect, useState } from "react";

import DragItem from "./DragItem";
import DropGuide from "./DropGuide";
import DropZone from "./DropZone";

export interface DropPayload {
  dragItemId: string | null;
  dragType: string | null;
  dropZoneId: string | null;
}

export interface DragContextValue {
  draggable: boolean;
  dragItemId: string | null;
  dragType: string | null;
  isDragging: boolean;
  dragStart: (e: React.DragEvent, dragId: string, dragType: string) => void;
  drag: (e: React.DragEvent, dragId: string, dragType: string) => void;
  dragEnd: () => void;
  dropZoneId: string | null;
  setDropZoneId: React.Dispatch<React.SetStateAction<string | null>>;
  onDrop: (e: React.DragEvent) => void;
}

interface RenderProps {
  activeItem: string | null;
  activeType: string | null;
  isDragging: boolean;
}

interface DragProps {
  draggable?: boolean;
  handleDrop: (payload: DropPayload) => void;
  /** Content or render function receiving { activeItem, activeType, isDragging } */
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
}

export const DragContext = createContext<DragContextValue | null>(null);

/**
 * Root component that provides drag-and-drop via React context.
 * Manages the currently-dragged item, active drop zone, and cursor style.
 */
function Drag({ draggable = true, handleDrop, children }: DragProps) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dropZoneId, setDropZoneId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.cursor = dragItemId ? "grabbing" : "default";
  }, [dragItemId]);

  const dragStart = function (
    e: React.DragEvent,
    dragId: string,
    dragType: string,
  ) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    setDragItemId(dragId);
    setDragType(dragType);
  };

  // Called continuously while a DragItem is being dragged
  const drag = function (
    e: React.DragEvent,
    _dragId: string,
    _dragType: string,
  ) {
    e.stopPropagation();
    setIsDragging(true);
  };

  const dragEnd = function () {
    setDragItemId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);
  };

  // Called when a drop occurs on a DropZone
  const onDrop = function (e: React.DragEvent) {
    e.preventDefault();
    handleDrop({ dragItemId, dragType, dropZoneId });
    setDragItemId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);
  };

  return (
    <DragContext.Provider
      value={{
        draggable,
        dragItemId,
        dragType,
        isDragging,
        dragStart,
        drag,
        dragEnd,
        dropZoneId,
        setDropZoneId,
        onDrop,
      }}
    >
      {typeof children === "function"
        ? children({ activeItem: dragItemId, activeType: dragType, isDragging })
        : children}
    </DragContext.Provider>
  );
}

export default Object.assign(Drag, { DragItem, DropZone, DropGuide });
