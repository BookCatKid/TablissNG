import "./style.sass";

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
import { SelectLabelsForm } from "../Labels/SelectLabelsForm";

interface CardProps {
  card: CardType;
  listId: string;
  position: number; // 0-index to its position in the list
  dispatchUI: React.Dispatch<CacheReducerAction>;
}

export function Card({ card, listId, position, dispatchUI }: CardProps) {
  const [hoveringOverHeader, setHoveringOverHeader] = useState<boolean>(false);
  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(card.name);

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
      className="card-content-container"
      onMouseEnter={() => setHoveringOverHeader(true)}
      onMouseLeave={() => setHoveringOverHeader(false)}
    >
      <div className="card-header">
        <div className="card-labels-container">
          {card.labels.map((label) => (
            <div
              key={label.color}
              className="card-label"
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
        <span
          className={`edit-card-buttons ${hoveringOverHeader ? "visible" : ""}`}
        >
          {!isEditingTags && (
            <>
              {isEditingContent ? (
                <span onClick={handleDelete}>
                  <RemoveIcon />
                </span>
              ) : (
                <span onClick={handleEdit}>
                  <EditIcon />
                </span>
              )}
            </>
          )}
          <span onClick={handleEditTags}>
            <LabelsIcon />
          </span>
        </span>
      </div>

      {/* Card editor */}
      {isEditingContent ? (
        <textarea
          ref={textareaRef}
          className="card-name-editor"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span>{card.name}</span>
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
            <SelectLabelsForm />
          </div>,
          document.body,
        )}
    </div>
  );
}
