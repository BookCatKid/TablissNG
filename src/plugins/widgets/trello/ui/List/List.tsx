import "./List.sass";

import { useContext, useEffect, useState } from "react";

import { ExpandIcon } from "../../../../../views/shared";
import { Spinner } from "../../../../shared";
import { CacheReducerAction } from "../../cacheReducer";
import { Item } from "../../types";
import {
  DoubleDropZone,
  DragContext,
  DraggableItem,
  DropGuide,
  DropZone,
} from "../Drag";
import { ItemCreatorForm } from "./ItemCreatorForm";
import { ListItem } from "./ListItem";

interface ListComponentProps {
  header: string;
  listId: string;
  items: Item[];
  loading: boolean | undefined;
  dispatchUI: React.Dispatch<CacheReducerAction>;
}

export function List({
  header,
  listId,
  items,
  loading,
  dispatchUI,
}: ListComponentProps) {
  const context = useContext(DragContext);
  const [hoveringOverHeader, setHoveringOverHeader] = useState<boolean>(false);
  const [itemCreatorOpen, setItemCreatorOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setItemCreatorOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!context) {
    return null;
  }

  const { isDragging, dragItemId } = context;
  const openItemCreator = () => {
    console.log("opening item creator");
    setItemCreatorOpen(true);
  };

  return (
    <div className="list">
      <div
        className="list-header-container"
        onMouseEnter={() => setHoveringOverHeader(true)}
        onMouseLeave={() => setHoveringOverHeader(false)}
      >
        <h3 className="list-header">{header}</h3>
        <span
          onClick={() => openItemCreator()}
          className={`add-item-button ${hoveringOverHeader && !itemCreatorOpen ? "visible" : ""}`}
        >
          <ExpandIcon />
          {"Add a card"}
        </span>
      </div>
      {loading || !items ? (
        <div className="list-loader-container">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="list-item-container">
          {itemCreatorOpen && (
            <ItemCreatorForm
              listId={listId}
              dispatchUI={dispatchUI}
              onFormSubmit={() => setItemCreatorOpen(false)}
            />
          )}
          {items.map((item, i) => (
            <DoubleDropZone
              key={item.id}
              previousId={`list-${listId}-item-${i}`}
              nextId={`list-${listId}-item-${i + 1}`}
              dropType="ITEM"
              remember
            >
              <DropGuide dropType="ITEM" dropId={`list-${listId}-item-${i}`} />
              <DraggableItem
                dragId={`list-${listId}-item-${i}`}
                dragType="ITEM"
                className={
                  isDragging &&
                  dragItemId === `list-${listId}-item-${i}` &&
                  "hide-list-item"
                }
              >
                <ListItem key={item.id} item={item} />
              </DraggableItem>
            </DoubleDropZone>
          ))}
          {/* allow placing items at the end of the list */}
          <DropZone
            dropId={`list-${listId}-item-${items.length}`}
            dropType="ITEM"
            style={{ minHeight: items.length === 0 ? "4rem" : undefined }}
          >
            <DropGuide
              dropType="ITEM"
              dropId={`list-${listId}-item-${items.length}`}
            />
          </DropZone>
        </div>
      )}
    </div>
  );
}
