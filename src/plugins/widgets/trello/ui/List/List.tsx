import "./List.sass";

import { useRef } from "react";

import { Spinner } from "../../../../shared";
import { useDragContext } from "../../contexts/DragContext";
import { isItem, RealOrPlaceholderItem } from "../../types";
import DisplayItem from "./DisplayItem";

interface ListComponentProps {
  header: string;
  listId: string;
  items: RealOrPlaceholderItem[] | undefined;
  loading: boolean | undefined;
}

export function List({ header, listId, items, loading }: ListComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerListRef } = useDragContext();

  // Register this list as a drop zone
  const setRef = (element: HTMLDivElement | null) => {
    if (element) {
      registerListRef(listId, element);
    }
    containerRef.current = element;
  };

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {loading || !items ? (
        <div className="loader-container">
          <Spinner size={24} />
        </div>
      ) : (
        <div className={`display-list-items`} ref={setRef}>
          {items.map((item, i) => (
            <DisplayItem
              key={isItem(item) ? item.id : `skeleton-${i}`}
              item={item}
              listId={listId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
