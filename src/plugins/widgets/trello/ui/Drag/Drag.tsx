import { createContext, useEffect, useState } from "react";

import { DragItemStyle } from "../../types";
import { DraggableItem } from "./DraggableItem";
import { DropGuide } from "./DropGuide";
import { DropZone } from "./DropZone";

export interface DropPayload {
  dragItemId: string | null;
  dragType: string | null;
  dropZoneId: string | null;
}

type OnDragStart = (
  e: React.DragEvent,
  dragId: string,
  dragType: string,
  element: HTMLElement,
) => void;
type OnDrag = (e: React.DragEvent) => void;
type OnDragEnd = () => void;

export interface DragContextValue {
  draggable: boolean;
  dragItemId: string | null;
  dragItemStyle: DragItemStyle | null;
  dragType: string | null;
  isDragging: boolean;
  dragStart: OnDragStart;
  drag: OnDrag;
  dragEnd: OnDragEnd;
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
export function Drag({ draggable = true, handleDrop, children }: DragProps) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragItemStyle, setDragItemStyle] = useState<DragItemStyle | null>(
    null,
  );
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
    element: HTMLElement,
  ) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";

    // Extract styles
    const style = element.computedStyleMap();
    const fontSize = (style.get("font-size") as CSSUnitValue).value;
    const { width, height } = element.getBoundingClientRect();
    setDragItemStyle({ size: { width, height }, fontSize });

    setDragItemId(dragId);
    setDragType(dragType);
  };

  // Called continuously while a DragItem is being dragged
  // Possibly optimise to prevent excessive rerenders
  const drag = function (e: React.DragEvent) {
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
        dragItemStyle,
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

export default Object.assign(Drag, { DraggableItem, DropZone, DropGuide });
