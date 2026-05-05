import "./List.sass";

import { useContext } from "react";

import { Spinner } from "../../../../shared";
import { Item } from "../../types";
import {
  DoubleDropZone,
  DragContext,
  DraggableItem,
  DropGuide,
  DropZone,
} from "../Drag";
import ListItem from "./ListItem";

interface ListComponentProps {
  header: string;
  listId: string;
  items: Item[];
  loading: boolean | undefined;
}

export function List({ header, listId, items, loading }: ListComponentProps) {
  const context = useContext(DragContext);

  if (!context) {
    return null;
  }

  const { isDragging, dragItemId } = context;

  return (
    <div className="list">
      <h3 className="list-header">{header}</h3>
      {loading || !items ? (
        <div className="list-loader-container">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="list-item-container">
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
