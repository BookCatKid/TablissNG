import React, { useRef } from "react";
import { Item } from "../../types";
import { Spinner } from "../../../../shared";
import "./DisplayList.sass";
import DisplayItem from "./DisplayItem";
import { useDragContext } from "../../contexts/DragContext";

interface DisplayListComponentProps {
  header: string;
  listId: string;
  items: Item[] | undefined;
  loading: boolean | undefined;
}

export default function DisplayList({
  header,
  listId,
  items,
  loading,
}: DisplayListComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerDisplayListRef, dragState } = useDragContext();

  // Register this list as a drop zone
  const setRef = (element: HTMLDivElement | null) => {
    if (element) {
      registerDisplayListRef(listId, element);
    }
    containerRef.current = element;
  };

  // Check if this list is the current drop target
  const isDropTarget =
    dragState.overListId === listId && dragState.sourceListId !== listId;

  const view =
    loading || !items ? (
      <div className="loader-container">
        <Spinner size={24} />
      </div>
    ) : (
      <div
        className={`display-list-items${isDropTarget ? " is-drop-target" : ""}`}
        ref={setRef}
      >
        {items.map((item, i) => (
          <DisplayItem key={item.id + i} item={item} listId={listId} />
        ))}
      </div>
    );

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {view}
    </div>
  );
}
