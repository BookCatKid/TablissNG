import React, { FC, useLayoutEffect, useRef, useState } from "react";

import { useKeyPress } from "../../../hooks";
import { Icon, RemoveIcon } from "../../../views/shared";
import { State } from "./reducer";
import "./TodoItem.sass";

interface Props {
  item: State[number];
  onToggle(): void;
  onUpdate(contents: string): void;
  onDelete(): void;
  onDragStart(): void;
  onDragOver(e: React.DragEvent): void;
  onDrop(e: React.DragEvent): void;
  onDragEnd(): void;
  dropIndicator: "above" | "below" | null;
}

const TodoItem: FC<Props> = ({
  item,
  onDelete,
  onUpdate,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dropIndicator,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.innerText = item.contents;

      if (item.contents === "") {
        ref.current.focus();
      }
    }
  }, [item.contents]);

  useKeyPress(
    (event) => {
      if (event.target === ref.current) {
        event.preventDefault();

        if (ref.current) {
          ref.current.blur();
        }
      }
    },
    ["Enter"],
    false,
  );

  useKeyPress(
    (event) => {
      if (event.target === ref.current) {
        event.preventDefault();

        if (ref.current) {
          // Reset contents on escape
          ref.current.innerText = item.contents;
          ref.current.blur();
        }
      }
    },
    ["Escape"],
    false,
  );

  const className = [
    "TodoItem",
    isDragging ? "dragging" : "",
    dropIndicator === "above" ? "drop-above" : "",
    dropIndicator === "below" ? "drop-below" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
        onDragStart();
      }}
      onDragOver={onDragOver}
      onDrop={(e) => {
        setIsDragging(false);
        onDrop(e);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
    >
      <a className="drag-handle">
        <Icon name="more-vertical" />
      </a>

      <span
        ref={ref}
        contentEditable={true}
        onBlur={(event) => onUpdate(event.currentTarget.innerText)}
      />

      <a onMouseDown={onToggle} className="complete">
        <Icon name={item.completed ? "check-circle" : "circle"} />
      </a>
      <a onMouseDown={onDelete} className="delete">
        <RemoveIcon />
      </a>
    </div>
  );
};

export default TodoItem;
