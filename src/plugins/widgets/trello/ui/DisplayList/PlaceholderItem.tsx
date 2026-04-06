import { useEffect, useRef } from "react";

import { useDragContext } from "../../contexts/DragContext";

interface PlaceholderItemProps {
  listId: string;
  width: number;
  height: number;
}

export default function PlaceholderItem({
  listId,
  width,
  height,
}: PlaceholderItemProps) {
  const { registerPlaceholderRef } = useDragContext();
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Register on mount, deregister on unmount
    return () => {
      registerPlaceholderRef(listId, null);
    };
  }, [listId, registerPlaceholderRef]);

  const setRef = (element: HTMLDivElement | null) => {
    ref.current = element;
    // Registers (element present) or deregisters (null on unmount) the
    // placeholder element with DragContext so pointer-move hit testing
    // includes this slot when calculating destinationIndex
    registerPlaceholderRef(listId, element);
  };

  return (
    <div
      ref={setRef}
      className="display-list-item-content"
      style={{
        visibility: "hidden",
        pointerEvents: "none",
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}
