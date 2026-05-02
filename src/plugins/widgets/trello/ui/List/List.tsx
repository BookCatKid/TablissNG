import "./List.sass";

import { Spinner } from "../../../../shared";
import { Item } from "../../types";
import { DoubleDropZone, DraggableItem,DropGuide } from "../Drag";
import ListItem from "./ListItem";

interface ListComponentProps {
  header: string;
  listId: string;
  items: Item[];
  loading: boolean | undefined;
}

export function List({ header, listId, items, loading }: ListComponentProps) {
  return (
    <div className="list">
      <h3 className="list-header">{header}</h3>
      {loading || !items ? (
        <div className="loader-container">
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
              <DraggableItem dragId={item.id} dragType="ITEM">
                <ListItem key={item.id} item={item} />
              </DraggableItem>
            </DoubleDropZone>
          ))}
        </div>
      )}
    </div>
  );
}
