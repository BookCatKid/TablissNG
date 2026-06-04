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

  const lastRenderTimeRef = useRef<DOMHighResTimeStamp>(0);
  const cursorPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousCursorPositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const ghostRef = useRef<HTMLImageElement | null>(null);
  const dragOverListenerRef = useRef<(e: DragEvent) => void>(null);

  /**
   * We need an image to override the one used in default drag behaviour
   * However firefox does not allow empty images to be used
   * hence make this 1px gif instead
   */
  useEffect(() => {
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    ghostRef.current = img;
  }, []);

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
    e.dataTransfer.setData("text/plain", dragId);

    // Extract styles
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const { width, height } = element.getBoundingClientRect();
    setDragCardStyle({ size: { width, height }, fontSize });

    /**
     * By default, dragging creates an image of the component
     * but this image cannot be styled with css
     * hence we remove it and replace it with a DOM element that can be
     */
    if (ghostRef.current) {
      e.dataTransfer.setDragImage(ghostRef.current, 0, 0);
    }

    // Attach styles to overlaid component
    const clone = element.cloneNode(true) as HTMLElement;

    console.log("CLONE CLasses ", clone.classList);
    console.log("CLONE style ", clone.style);

    clone.style.removeProperty("background");
    clone.style.removeProperty("backdrop-blur");
    clone.style.removeProperty("box-shadow");

    clone.classList.add("dragging-card");

    clone.style.width = `${element.offsetWidth}px`;
    clone.style.fontSize = `${fontSize}px`;
    clone.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;

    cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    previousCursorPositionRef.current = { x: e.clientX, y: e.clientY };

    console.log("CLONE CLasses ", clone.classList);
    console.log("CLONE style ", clone.style);
    document.body.appendChild(clone);
    overlayRef.current = clone;

    // Attach event listener
    const handleDragOver = (e: DragEvent) => {
      cursorPositionRef.current = { x: e.clientX, y: e.clientY };

      const distance = Math.hypot(
        previousCursorPositionRef.current.x - cursorPositionRef.current.x,
        previousCursorPositionRef.current.y - cursorPositionRef.current.y,
      );

      // Fix visual glitch on chrome where overlay jumps massively to weird positions
      if (distance > 200) {
        return;
      }

      if (currentFrameRef.current) {
        cancelAnimationFrame(currentFrameRef.current);
      }

      currentFrameRef.current = requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.style.transform = `translate(${cursorPositionRef.current.x}px, ${cursorPositionRef.current.y}px) translate(-50%, -50%)`;
          previousCursorPositionRef.current = cursorPositionRef.current;
        }
      });
    };

    document.addEventListener("dragover", handleDragOver);
    dragOverListenerRef.current = handleDragOver;

    setDragCardId(dragId);
    setDragType(dragType);
  };

  // Called continuously while a DragCard is being dragged
  // We set is dragging here rather than in at the start.
  // Dragging state is used when rendering drop guides and hiding cards when needed
  // Setting it too early will result in the original card being hidden before we can form an overlay
  const drag = (e: React.DragEvent) => {
    e.stopPropagation();
    // Throttle updates to prevent visual glitches
    if (performance.now() - lastRenderTimeRef.current > 100) {
      lastRenderTimeRef.current = performance.now();
      setIsDragging(true);
    }
  };

  const dragEnd = () => {
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    if (dragOverListenerRef.current) {
      document.removeEventListener("dragover", dragOverListenerRef.current);
      dragOverListenerRef.current = null;
    }

    setDragCardId(null);
    setDragType(null);
    setIsDragging(false);
    setDropZoneId(null);
  };

  // Called when a drop occurs on a DropZone
  const onDrop = function (e: React.DragEvent) {
    e.preventDefault();

    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    handleDrop({ dragCardId, dragType, dropZoneId });
    dragEnd();
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
