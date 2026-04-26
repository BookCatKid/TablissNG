import { useRef } from "react";

import { useDragContext } from "../../contexts/DragContext";
import { colourPalette, isItem, RealOrPlaceholderItem } from "../../types";
import PlaceholderItem from "./PlaceholderItem";

interface DisplayItemProps {
  item: RealOrPlaceholderItem;
  listId: string;
}

export default function DisplayItem({ item, listId }: DisplayItemProps) {
  const typeIsItem = isItem(item);

  const itemRef = useRef<HTMLDivElement | null>(null);
  const { registerItemRef, startDrag, dragState } = useDragContext();
  const style = dragState?.style.size;

  const setRef = (element: HTMLDivElement) => {
    if (element && typeIsItem) {
      registerItemRef(listId, element, item);
    }
    itemRef.current = element;
  };

  const handlePointerDown = () => {
    if (itemRef.current && typeIsItem) {
      startDrag(item, listId, itemRef.current);
    }
  };

  return !typeIsItem ? (
    <PlaceholderItem
      listId={listId}
      width={style ? style.width : 100}
      height={style ? style.height : 60}
    />
  ) : (
    <div
      ref={setRef}
      className="display-list-item-content"
      onPointerDown={handlePointerDown}
    >
      <div className="labels-container">
        {item.labels.map((label) => (
          <div
            key={label.color}
            style={{
              width: "2.5rem",
              height: "0.26rem",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
              background: colourPalette[label.color],
            }}
          />
        ))}
      </div>
      <span>{item.name}</span>
    </div>
  );
}
