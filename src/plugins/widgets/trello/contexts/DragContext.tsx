import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { DraggedItemStyle, Item } from "../types";

type ListIdToDisplayList = Map<string, HTMLDivElement>;
type ListIdToItemElements = Map<
  string,
  { element: HTMLDivElement; item: Item }[]
>;

// Information encoded in the currently dragged item
// null when no item is being dragged
type DragState = null | {
  item: Item;
  sourceListId: string;
  overListId: string | null; // id of the display list the dragged object is hovering over
  overItemId: string | null; // id of any cards the dragged item is over
  position: { x: number; y: number };
  sourceItemIndex: number;
  destinationItemIndex: number | null;
  style: DraggedItemStyle;
  cursorPosition: { x: number; y: number };
};

// Context provider information
interface DragContextValue {
  dragState: DragState;
  itemsRef: ListIdToItemElements;
  displayListsRef: ListIdToDisplayList;
  registerDisplayListRef: (
    listId: string,
    element: HTMLDivElement | null,
  ) => void;
  registerItemRef: (
    listId: string,
    element: HTMLDivElement | null,
    item: Item,
  ) => void;
  startDrag: (
    item: Item,
    listId: string,
    element: HTMLElement,
    onStart: (
      item: Item,
      sourceItemIndex: number,
      sourceListId: string,
      style: DraggedItemStyle,
    ) => void,
  ) => void;
  endDrag: (
    onDrop: (
      item: Item,
      insertIndex: number,
      fromListId: string,
      toListId: string,
    ) => void,
    onCancel: (sourceItemIndex: number, sourceListId: string) => void,
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
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Keep track of current display lists on screen
  const displayListsRef = useRef<ListIdToDisplayList>(new Map());

  // Keep track of items under each display list
  const itemsRef = useRef<ListIdToItemElements>(new Map());

  const registerDisplayListRef = useCallback(
    (listId: string, element: HTMLDivElement | null) => {
      if (element) {
        displayListsRef.current.set(listId, element);
      } else {
        displayListsRef.current.delete(listId);
      }
    },
    [],
  );

  const registerItemRef = useCallback(
    (listId: string, element: HTMLDivElement | null, item: Item) => {
      if (element) {
        if (!itemsRef.current.has(listId)) {
          itemsRef.current.set(listId, []);
        }

        const obj = itemsRef.current.get(listId)!;
        const existingIndex = obj.findIndex((o) => o.item.id === item.id);
        const pair = { element: element, item: item };
        if (existingIndex !== -1) {
          obj[existingIndex] = pair;
        } else {
          obj.push(pair);
        }
      }
    },
    [],
  );

  const startDrag = useCallback(
    (
      item: Item,
      listId: string,
      element: HTMLElement,
      onStart: (
        item: Item,
        sourceItemIndex: number,
        sourceListId: string,
        style: DraggedItemStyle,
      ) => void,
    ) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const fontSize = (
        element.computedStyleMap().get("font-size") as CSSUnitValue
      ).value;

      // Store where in the element the pointer grabbed (center it for now)
      const cursorPosition = { x: width / 2, y: height / 2 };

      // Set position for source skeleton
      const elementItemPairs = itemsRef.current.get(listId)!;
      const sourceIndex = elementItemPairs.findIndex(
        (pair) => pair.item.id === item.id,
      );
      if (sourceIndex === -1) {
        console.error("TRELLO: error starting drag");
        return;
      }

      // UI style of the dragged item
      const style: DraggedItemStyle = {
        size: { width, height },
        fontSize: fontSize,
      };

      // Trigger side effects such as placing skeletons
      onStart(item, sourceIndex, listId, style);

      setDragState({
        item,
        sourceListId: listId,
        overListId: listId, // Start over the source list
        overItemId: item.id, // Start over the source item
        sourceItemIndex: sourceIndex,
        destinationItemIndex: null,
        position: { x: rect.left, y: rect.top },
        style: style,
        cursorPosition,
      });
    },
    [],
  );

  const endDrag = useCallback(
    (
      onDrop: (
        item: Item,
        insertIndex: number,
        fromListId: string,
        toListId: string,
      ) => void,
      onCancel: (sourceItemIndex: number, sourceListId: string) => void,
    ) => {
      if (!dragState) {
        return;
      }

      console.log("Drag over list id", dragState.overListId);
      console.log("Destination item index ", dragState.destinationItemIndex);
      console.log("Destination source item index ", dragState.sourceItemIndex);
      console.log("Destination over item id ", dragState.overItemId);

      if (dragState.overListId === null) {
        // Drag was cancelled due to being dropped on itself or dropped outside a list
        // Currently on cancel will restore moved item back to its original location
        console.log("Calling on cancel");
        onCancel(dragState.sourceItemIndex, dragState.sourceListId);
      } else {
        console.log("Calling on drop");
        onDrop(
          dragState.item,
          dragState.destinationItemIndex!,
          dragState.sourceListId,
          dragState.overListId,
        );
      }

      // Clear drag state
      setDragState(null);
    },
    [dragState],
  );

  // Check position of item being dragged and update drag state
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragState((prev) => {
        if (!prev) {
          return null;
        }

        const newX = e.clientX - prev.cursorPosition.x;
        const newY = e.clientY - prev.cursorPosition.y;

        // Check which list we're over
        let overListId: string | null = null;
        let overItemId: string | null = null;
        let overItemName: string | null = null;

        displayListsRef.current.forEach((element, listId) => {
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

        let destinationIndex = prev.destinationItemIndex;
        if (overListId) {
          // Check which item we're over
          const elementItemPairs = itemsRef.current.get(overListId)!;

          for (const pair of elementItemPairs) {
            const rect = pair.element.getBoundingClientRect();
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              overItemId = pair.item.id;
              overItemName = pair.item.name;
              break;
            }
          }

          if (overItemId && overItemName) {
            // Locate position of item
            destinationIndex = elementItemPairs.findIndex(
              (pair) => pair.item.id === overItemId,
            );
            if (destinationIndex === -1) {
              console.error("TRELLO: error while moving item");
            }
          }
        }

        // Update
        // cursor position
        // list we are currently over
        // item we are currently over
        // the position of the item we are currently over
        return {
          ...prev,
          position: { x: newX, y: newY },
          overListId: overListId,
          overItemId: overItemId,
          destinationItemIndex: destinationIndex,
        };
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [dragState]);

  const isDragging = dragState !== null;

  return (
    <DragContext.Provider
      value={{
        dragState,
        itemsRef: itemsRef.current,
        displayListsRef: displayListsRef.current,
        registerDisplayListRef,
        registerItemRef,
        startDrag,
        endDrag,
        isDragging,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}
