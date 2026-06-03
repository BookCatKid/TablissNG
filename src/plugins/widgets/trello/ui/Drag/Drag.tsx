import "./style.sass";

import { createContext, useEffect, useRef, useState } from "react";

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
  const overlayRef = useRef<HTMLElement | null>(null);
  const currentFrameRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.cursor = dragCardId ? "grabbing" : "default";
  }, [dragCardId]);

  const dragStart = (
    e: React.DragEvent,
    dragId: string,
    dragType: string,
    element: HTMLElement,
  ) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";

    // Extract styles
    const style = element.computedStyleMap();
    const fontSize = (style.get("font-size") as CSSUnitValue).value;
    const { width, height } = element.getBoundingClientRect();
    setDragCardStyle({ size: { width, height }, fontSize });

    /**
     * By default, dragging creates an image of the component
     * but this image cannot be styled with css
     * hence we remove it and replace it with a DOM element that can be
     */

    e.dataTransfer.setDragImage(new Image(), 0, 0);

    // Attach styles to overlaid component
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.add("dragging-card");
    clone.style.width = `${element.offsetWidth}px`;
    clone.style.fontSize = `${fontSize}px`;
    clone.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;

    document.body.appendChild(clone);
    overlayRef.current = clone;

    setDragCardId(dragId);
    setDragType(dragType);
  };

  // Called continuously while a DragCard is being dragged
  const drag = (e: React.DragEvent) => {
    e.stopPropagation();
    e.stopPropagation();
    const x = e.clientX;
    const y = e.clientY;

    if (currentFrameRef.current) cancelAnimationFrame(currentFrameRef.current);
    currentFrameRef.current = requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    });
    setIsDragging(true);
  };

  const dragEnd = () => {
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    setDragCardId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);

    if (currentFrameRef.current) {
      cancelAnimationFrame(currentFrameRef.current);
      currentFrameRef.current = null;
    }
  };

  // Called when a drop occurs on a DropZone
  const onDrop = function (e: React.DragEvent) {
    e.preventDefault();

    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    handleDrop({ dragCardId, dragType, dropZoneId });
    setDragCardId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);

    if (currentFrameRef.current) {
      cancelAnimationFrame(currentFrameRef.current);
      currentFrameRef.current = null;
    }
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
