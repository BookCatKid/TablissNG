import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Item } from "../types";

// Information encoded in the currently dragged item
interface DragState {
  item: Item | null;
  sourceListId: string | null;
  overListId: string | null; // id of the display list the dragged object is hovering over
  position: { x: number; y: number } | null;
  elementStyle: null | {
    size: { width: number; height: number };
    fontSize: number; // Measured in pixels
  };
  pointerOffset: { x: number; y: number } | null;
}

// Context provider information
interface DragContextValue {
  dragState: DragState;
  displayListRefs: Map<string, HTMLDivElement>;
  registerDisplayListRef: (
    listId: string,
    element: HTMLDivElement | null,
  ) => void;
  startDrag: (item: Item, listId: string, element: HTMLElement) => void;
  endDrag: (
    onMove: (itemId: string, fromListId: string, toListId: string) => void,
  ) => void;
  isDragging: boolean;
}

const DragContext = createContext<DragContextValue | null>(null);

export function useDragContext() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragContextProvider");
  }
  return context;
}

interface DragContextProviderProps {
  children: React.ReactNode;
}

export function DragContextProvider({ children }: DragContextProviderProps) {
  const [dragState, setDragState] = useState<DragState>({
    item: null,
    sourceListId: null,
    overListId: null,
    position: null,
    elementStyle: null,
    pointerOffset: null,
  });

  const displayListRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const registerDisplayListRef = useCallback(
    (listId: string, element: HTMLDivElement | null) => {
      if (element) {
        displayListRefs.current.set(listId, element);
      } else {
        displayListRefs.current.delete(listId);
      }
    },
    [],
  );

  const startDrag = useCallback(
    (item: Item, listId: string, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const fontSize = (
        element.computedStyleMap().get("font-size") as CSSUnitValue
      ).value;

      // Store where in the element the pointer grabbed (center it for now)
      const pointerOffset = { x: width / 2, y: height / 2 };

      setDragState({
        item,
        sourceListId: listId,
        overListId: listId, // Start over the source list
        position: { x: rect.left, y: rect.top },
        elementStyle: { size: { width, height }, fontSize: fontSize },
        pointerOffset,
      });
    },
    [],
  );

  const endDrag = useCallback(
    (
      onMove: (itemId: string, fromListId: string, toListId: string) => void,
    ) => {
      if (dragState.item && dragState.sourceListId && dragState.overListId) {
        // Only move if dropped on a different list
        if (dragState.sourceListId !== dragState.overListId) {
          onMove(
            dragState.item.id,
            dragState.sourceListId,
            dragState.overListId,
          );
        }
      }

      setDragState({
        item: null,
        sourceListId: null,
        overListId: null,
        position: null,
        elementStyle: null,
        pointerOffset: null,
      });
    },
    [dragState.item, dragState.sourceListId, dragState.overListId],
  );

  // Update position and check drop zones on pointer move
  useEffect(() => {
    if (!dragState.item) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragState((prev) => {
        if (!prev.item || !prev.elementStyle || !prev.pointerOffset)
          return prev;

        const newX = e.clientX - prev.pointerOffset.x;
        const newY = e.clientY - prev.pointerOffset.y;

        // Check which list we're over
        let overListId: string | null = null;
        displayListRefs.current.forEach((element, listId) => {
          const rect = element.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            overListId = listId;
          }
        });

        return {
          ...prev,
          position: { x: newX, y: newY },
          overListId: overListId ?? prev.overListId,
        };
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [dragState.item]);

  const isDragging = dragState.item !== null;

  return (
    <DragContext.Provider
      value={{
        dragState,
        displayListRefs: displayListRefs.current,
        registerDisplayListRef,
        startDrag,
        endDrag,
        isDragging,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}
