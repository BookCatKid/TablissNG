import { createContext, useEffect, useState } from "react";

import { DragCardStyle } from "../../types";
import { DraggableCard } from "./DraggableCard";
import { DropGuide } from "./DropGuide";
import { DropZone } from "./DropZone";

export interface DropPayload {
  dragCardId: string | null;
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
  dragCardId: string | null;
  dragCardStyle: DragCardStyle | null;
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
  activeCard: string | null;
  activeType: string | null;
  isDragging: boolean;
}

interface DragProps {
  draggable?: boolean;
  handleDrop: (payload: DropPayload) => void;
  /** Content or render function receiving { activeCard, activeType, isDragging } */
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
}

export const DragContext = createContext<DragContextValue | null>(null);

/**
 * Root component that provides drag-and-drop via React context.
 * Manages the currently-dragged card, active drop zone, and cursor style.
 */
export function Drag({ draggable = true, handleDrop, children }: DragProps) {
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragCardStyle, setDragCardStyle] = useState<DragCardStyle | null>(
    null,
  );
  const [dragType, setDragType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dropZoneId, setDropZoneId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.cursor = dragCardId ? "grabbing" : "default";
  }, [dragCardId]);

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
    setDragCardStyle({ size: { width, height }, fontSize });

    setDragCardId(dragId);
    setDragType(dragType);
  };

  // Called continuously while a DragCard is being dragged
  // Possibly optimise to prevent excessive rerenders
  const drag = function (e: React.DragEvent) {
    e.stopPropagation();
    setIsDragging(true);
  };

  const dragEnd = function () {
    setDragCardId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);
  };

  // Called when a drop occurs on a DropZone
  const onDrop = function (e: React.DragEvent) {
    e.preventDefault();
    handleDrop({ dragCardId, dragType, dropZoneId });
    setDragCardId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);
  };

  return (
    <DragContext.Provider
      value={{
        draggable,
        dragCardId,
        dragCardStyle,
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
        ? children({ activeCard: dragCardId, activeType: dragType, isDragging })
        : children}
    </DragContext.Provider>
  );
}

export default Object.assign(Drag, { DraggableCard, DropZone, DropGuide });
