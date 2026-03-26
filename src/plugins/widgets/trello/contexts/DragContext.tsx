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

type PlaceholderEntry = { element: HTMLDivElement };
type ListIdToPlaceholder = Map<string, PlaceholderEntry>;

// Callback types
type OnDragStart = (
  item: Item,
  sourceItemIndex: number,
  sourceListId: string,
  style: DraggedItemStyle,
) => void;

type OnDragItemDrop = (
  item: Item,
  insertIndex: number,
  fromListId: string,
  toListId: string,
) => void;

type OnDragItemOverlap = (
  fromListId: string,
  index: number | null,
  listId: string | null,
  style: DraggedItemStyle | null,
) => void;

type OnDragCancel = (
  sourceItem: Item,
  sourceItemIndex: number,
  sourceListId: string,
) => void;

// Information encoded in the currently dragged item
// null when no item is being dragged
type DragState = null | {
  item: Item;
  sourceListId: string;
  overListId: string | null;
  overItemId: string | null;
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
  // let skeleton/placeholder elements register themselves so the context
  // knows about them when computing destination indices
  registerPlaceholderRef: (
    listId: string,
    element: HTMLDivElement | null,
  ) => void;
  registerCallbacks: (
    onDragStart: OnDragStart,
    onDragItemDrop: OnDragItemDrop,
    onDragItemOverlap: OnDragItemOverlap,
    onDragCancel: OnDragCancel,
  ) => void;
  startDrag: (item: Item, listId: string, element: HTMLElement) => void;
  endDrag: () => void;
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
  const [dragState, setDragState] = useState<DragState>(null);

  const displayListsRef = useRef<ListIdToDisplayList>(new Map());
  const itemsRef = useRef<ListIdToItemElements>(new Map());

  // NEW: tracks the single placeholder element per list (at most one at a time)
  const placeholdersRef = useRef<ListIdToPlaceholder>(new Map());

  const overlapCallbackRef = useRef<OnDragItemOverlap | null>(null);

  const dragStartCallbackRef = useRef<OnDragStart | null>(null);
  const dragDropCallbackRef = useRef<OnDragItemDrop | null>(null);
  const dragCancelCallbackRef = useRef<OnDragCancel | null>(null);

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
        const pair = { element: element, item: item, placeholder: false };
        if (existingIndex !== -1) {
          obj[existingIndex] = pair;
        } else {
          obj.push(pair);
        }
      }
    },
    [],
  );

  // Stores at most one placeholder per list — clears the entry when element is null.
  const registerPlaceholderRef = useCallback(
    (listId: string, element: HTMLDivElement | null) => {
      if (element) {
        placeholdersRef.current.set(listId, { element });
      } else {
        placeholdersRef.current.delete(listId);
      }
    },
    [],
  );

  const startDrag = (item: Item, listId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const fontSize = (
      element.computedStyleMap().get("font-size") as CSSUnitValue
    ).value;

    const cursorPosition = { x: width / 2, y: height / 2 };

    const elementItemPairs = itemsRef.current.get(listId)!;
    const sourceIndex = elementItemPairs.findIndex(
      (pair) => pair.item.id === item.id,
    );
    if (sourceIndex === -1) {
      console.error("TRELLO: error starting drag");
      return;
    }

    const style: DraggedItemStyle = {
      size: { width, height },
      fontSize: fontSize,
    };

    if (dragStartCallbackRef.current) {
      dragStartCallbackRef.current(item, sourceIndex, listId, style);
    }

    setDragState({
      item,
      sourceListId: listId,
      overListId: listId,
      overItemId: item.id,
      sourceItemIndex: sourceIndex,
      destinationItemIndex: null,
      position: { x: rect.left, y: rect.top },
      style: style,
      cursorPosition,
    });
  };

  const endDrag = () => {
    if (!dragState) {
      return;
    }

    if (dragState.overListId === null) {
      if (dragCancelCallbackRef.current) {
        dragCancelCallbackRef.current(
          dragState.item,
          dragState.sourceItemIndex,
          dragState.sourceListId,
        );
      }
    } else {
      if (dragDropCallbackRef.current) {
        dragDropCallbackRef.current(
          dragState.item,
          dragState.destinationItemIndex!,
          dragState.sourceListId,
          dragState.overListId,
        );
      }
    }

    // NEW: clear all placeholder refs when drag ends so stale entries don't
    // affect the next drag session
    placeholdersRef.current.clear();

    setDragState(null);
  };

  const registerCallbacks = (
    onDragStart: OnDragStart,
    onDragItemDrop: OnDragItemDrop,
    onDragItemOverlap: OnDragItemOverlap,
    onDragCancel: OnDragCancel,
  ) => {
    dragStartCallbackRef.current = onDragStart;
    dragDropCallbackRef.current = onDragItemDrop;
    overlapCallbackRef.current = onDragItemOverlap;
    dragCancelCallbackRef.current = onDragCancel;
  };

  useEffect(() => {
    if (!dragState) return;

    const sourceListId = dragState.sourceListId;
    const dragStyle = dragState.style;

    const handlePointerMove = (e: PointerEvent) => {
      let overListId: string | null = null;
      let overItemId: string | null = null;
      let destinationIndex: number | null = null;

      // Find which list the cursor is over
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

      if (overListId) {
        const realItems = itemsRef.current.get(overListId) ?? [];
        const placeholder = placeholdersRef.current.get(overListId);

        console.log(`THERE ARE ${realItems.length} in the start`);

        // Build a unified sorted list of real item elements + the placeholder
        // element (if one exists in this list), ordered top-to-bottom by their
        // current DOM position. This ensures destinationIndex accounts for the
        // placeholder slot that has been rendered into the list.
        type SlotEntry =
          | { kind: "item"; element: HTMLDivElement; itemId: string }
          | { kind: "placeholder"; element: HTMLDivElement };

        const slots: SlotEntry[] = [
          ...realItems.map((p) => ({
            kind: "item" as const,
            element: p.element,
            itemId: p.item.id,
          })),
          ...(placeholder
            ? [{ kind: "placeholder" as const, element: placeholder.element }]
            : []),
        ].sort(
          (a, b) =>
            a.element.getBoundingClientRect().top -
            b.element.getBoundingClientRect().top,
        );

        console.log(
          `THERE ARE ${slots.length} in the processed including placeholder`,
        );

        // Find which slot the cursor is inside
        for (const slot of slots) {
          const rect = slot.element.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            if (slot.kind === "item") {
              overItemId = slot.itemId;
            }
            // Whether it's an item or the placeholder itself, record the
            // sorted index as the destination so callers get the correct
            // position in the fully-rendered list
            destinationIndex = slots.indexOf(slot);
            break;
          }
        }
      }

      console.log("OVER LIST ID ", overListId);
      console.log("OVER ITEM ID ", overItemId);
      console.log("DEST INDEX ", destinationIndex);

      setDragState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          position: {
            x: e.clientX - prev.cursorPosition.x,
            y: e.clientY - prev.cursorPosition.y,
          },
          overListId,
          overItemId,
          destinationItemIndex: destinationIndex,
        };
      });

      if (overlapCallbackRef.current) {
        overlapCallbackRef.current(
          sourceListId,
          destinationIndex,
          overListId,
          dragStyle,
        );
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [dragState]);

  const isDragging = dragState !== null;

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => {
      console.log("END dragging");
      endDrag();
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging, endDrag]);

  return (
    <DragContext.Provider
      value={{
        dragState,
        itemsRef: itemsRef.current,
        displayListsRef: displayListsRef.current,
        registerDisplayListRef,
        registerItemRef,
        registerPlaceholderRef,
        registerCallbacks,
        startDrag,
        endDrag,
        isDragging,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}
