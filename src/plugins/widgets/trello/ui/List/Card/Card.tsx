import "./style.sass";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import useAuth from "../../../../../../hooks/useAuth";
import {
  EditIcon,
  LabelsIcon,
  RemoveIcon,
} from "../../../../../../views/shared";
import { CacheReducerAction } from "../../../reducers";
import { trelloAuthStore } from "../../../stores/trelloAuthStore";
import { Card as CardType, colourPalette, TrelloSession } from "../../../types";
import { deleteCard, updateCardName } from "../../../utils/api";
import { LabelsForm } from "../Labels/LabelsForm";

interface CardProps {
  card: CardType;
  listId: string;
  boardId: string;
  position: number; // 0-index to its position in the list
  dispatchUI: React.Dispatch<CacheReducerAction>;
}

export function Card({
  card,
  listId,
  boardId,
  position,
  dispatchUI,
}: CardProps) {
  const [hoveringOverHeader, setHoveringOverHeader] = useState<boolean>(false);

  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(card.name);

  const isSelected = isEditingContent || isEditingTags;

  const selfRef = useRef<HTMLDivElement>(null);

  // Portals are used to display the tag editor
  const portalRef = useRef<HTMLDivElement>(null);
  const [tagEditorPosition, setTagPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getSession } = useAuth<TrelloSession>("trello", trelloAuthStore);

  useEffect(() => {
    if (isEditingContent && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditingContent]);

  useEffect(() => {
    if (isEditingTags && selfRef.current) {
      const r = selfRef.current.getBoundingClientRect();
      setTagPosition({ top: r.top, left: r.right + 8 });
    }
  }, [isEditingTags]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isEditingTags) return;
    const update = () => {
      if (selfRef.current) {
        const r = selfRef.current.getBoundingClientRect();
        setTagPosition({ top: r.top, left: r.right + 8 });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isEditingTags]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditingContent(false);
        setEditValue(card.name);
        setIsEditingTags(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [card.name]);

  const handleEdit = () => {
    setIsEditingContent(true);
    setEditValue(card.name);
  };

  const handleEditTags = () => {
    setIsEditingTags(true);
  };

  const handleSave = async () => {
    const session = await getSession();
    if (!session) return;

    const originalName = card.name;
    const cleaned = editValue.replace(/(\r\n|\n|\r)/gm, "");
    dispatchUI({
      type: "EDIT_CARD_NAME",
      cardId: card.id,
      listId,
      name: cleaned,
    });

    const actionSuccessful = await updateCardName(card.id, cleaned, session);
    if (!actionSuccessful) {
      dispatchUI({
        type: "EDIT_CARD_NAME",
        cardId: card.id,
        listId,
        name: originalName,
      });
    }
    setIsEditingContent(false);
  };

  useEffect(() => {
    if (!isEditingTags) return;
    const handler = (e: MouseEvent) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target as Node) &&
        selfRef.current &&
        !selfRef.current.contains(e.target as Node)
      ) {
        setIsEditingTags(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditingTags]);

  const handleDelete = async () => {
    const session = await getSession();
    if (!session) return;
    const originalCard = card;
    dispatchUI({
      type: "DELETE_CARD",
      cardId: card.id,
      listId,
    });

    const actionSuccessful = await deleteCard(card.id, session);
    if (!actionSuccessful) {
      dispatchUI({
        type: "ADD_CARD",
        card: originalCard,
        listId: listId,
        position: position,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      ref={selfRef}
      className={clsx("card-content-container", isSelected ? "selected" : "")}
      onMouseEnter={() => setHoveringOverHeader(true)}
      onMouseLeave={() => setHoveringOverHeader(false)}
    >
      <div className="card-header">
        <div className="card-labels-container">
          {card.labels.map((label) => (
            <div
              key={label.colour}
              className="card-label"
              style={{
                width: "2.5rem",
                height: "0.26rem",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
                background: colourPalette[label.colour],
              }}
            />
          ))}
        </div>
        <span
          className={clsx(
            "edit-card-buttons",
            hoveringOverHeader ? "visible" : "",
          )}
        >
          {isEditingContent ? (
            <span
              onClick={isEditingTags ? undefined : handleDelete}
              className={clsx("icon", isEditingTags ? "disabled" : "")}
            >
              <RemoveIcon />
            </span>
          ) : (
            <span
              onClick={isEditingTags ? undefined : handleEdit}
              className={clsx("icon", isEditingTags ? "disabled" : "")}
            >
              <EditIcon />
            </span>
          )}
          <span
            onClick={isEditingContent ? undefined : handleEditTags}
            className={clsx("icon", isEditingContent ? "disabled" : "")}
          >
            <LabelsIcon />
          </span>
        </span>
      </div>

      {/* Card editor */}
      {!isEditingContent ? (
        <span>{card.name}</span>
      ) : (
        <textarea
          ref={textareaRef}
          className="card-name-editor"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}

      {isEditingTags &&
        tagEditorPosition &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: "fixed",
              top: tagEditorPosition.top,
              left: tagEditorPosition.left,
              zIndex: 1000,
            }}
          >
            <LabelsForm labelsOnCard={card.labels} boardId={boardId} />
          </div>,
          document.body,
        )}
    </div>
  );
}
