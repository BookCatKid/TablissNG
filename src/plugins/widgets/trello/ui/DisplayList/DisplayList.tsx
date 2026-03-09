import React, { useRef, useState } from "react";
import { DisplayList, Item, colourPalette } from "../../types";
import { Spinner } from "../../../../shared";
import "./DisplayList.sass";
import DraggableItem from "./DraggableItem";

type ListItems = Record<string, HTMLDivElement>;

interface DisplayListComponentProps {
  header: string;
  items: Item[] | undefined;
  loading: boolean | undefined;
}

export default function DisplayList({
  header,
  items,
  loading,
}: DisplayListComponentProps) {
  const listItemRefs = useRef<ListItems>({});
  const [currentlyDragging, setCurrentlyDragging] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const handleDragStart = (itemName: string, element: HTMLDivElement) => {
    if (currentlyDragging[itemName]) return; // already being dragged

    // Grab the card's current position in the page before lifting
    const rect = element.getBoundingClientRect();
    const parentRect = element.offsetParent?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    };

    setCurrentlyDragging((prev) => ({
      ...prev,
      [itemName]: {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
      },
    }));
  };

  const view =
    loading || !items ? (
      <div className="loader-container">
        <Spinner size={24} />
      </div>
    ) : (
      <div className="display-list-items">
        {items.map((item, i) => {
          const dragging = !!currentlyDragging[item.name];
          const dragPosition = currentlyDragging[item.name];

          return (
            <React.Fragment key={item.name + i}>
              <div
                className="display-list-item-content"
                ref={(element) => {
                  if (element) listItemRefs.current[item.name] = element;
                  else delete listItemRefs.current[item.name];
                }}
                style={{ visibility: dragging ? "hidden" : "visible" }} // Hide when dragging
                onMouseDown={() =>
                  handleDragStart(item.name, listItemRefs.current[item.name])
                }
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

              {/* If dragging, show the draggable card instead */}
              {dragging && (
                <DraggableItem item={item} initialPosition={dragPosition} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {view}
    </div>
  );
}
