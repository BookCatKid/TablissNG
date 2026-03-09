import React, { FC, useRef, useState } from "react";

import { State } from "./reducer";
import TodoItem from "./TodoItem";
import "./TodoList.sass";

interface Props {
  items: State;
  allItems: State;
  show?: number;
  onToggle(id: string): void;
  onUpdate(id: string, contents: string): void;
  onRemove(id: string): void;
  onReorder(fromIndex: number, toIndex: number): void;
}

const TodoList: FC<Props> = ({
  items,
  allItems,
  onToggle,
  onUpdate,
  onRemove,
  onReorder,
  show = 0,
}) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<"above" | "below" | null>(
    null,
  );
  const dragItemId = useRef<string | null>(null);

  const visibleItems = items.slice(-show);

  const handleDragStart = (id: string) => {
    dragItemId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragItemId.current === id) {
      setDragOverId(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverId(id);
    setDragPosition(e.clientY < midY ? "above" : "below");
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = dragItemId.current;
    if (!fromId || fromId === targetId) {
      resetDrag();
      return;
    }

    const fromIndex = allItems.findIndex((t) => t.id === fromId);
    const targetIndex = allItems.findIndex((t) => t.id === targetId);

    if (fromIndex === -1 || targetIndex === -1) {
      resetDrag();
      return;
    }

    let toIndex = targetIndex + (dragPosition === "below" ? 1 : 0);
    if (fromIndex < toIndex) {
      toIndex -= 1;
    }

    onReorder(fromIndex, toIndex);
    resetDrag();
  };

  const resetDrag = () => {
    dragItemId.current = null;
    setDragOverId(null);
    setDragPosition(null);
  };

  return (
    <div className="TodoList">
      {visibleItems.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onUpdate={(contents) => onUpdate(item.id, contents)}
          onDelete={() => onRemove(item.id)}
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={resetDrag}
          dropIndicator={dragOverId === item.id ? dragPosition : null}
        />
      ))}
    </div>
  );
};

export default TodoList;
