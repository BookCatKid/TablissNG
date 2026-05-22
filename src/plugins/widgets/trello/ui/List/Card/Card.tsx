import "./style.sass";

import { useEffect, useRef, useState } from "react";

import useAuth from "../../../../../../hooks/useAuth";
import { EditIcon, RemoveIcon } from "../../../../../../views/shared";
import { CacheReducerAction } from "../../../reducers";
import { trelloAuthStore } from "../../../stores/trelloAuthStore";
import { Card as CardType, colourPalette, TrelloSession } from "../../../types";
import { deleteCard, updateCardName } from "../../../utils/api";

interface CardProps {
  card: CardType;
  listId: string;
  position: number; // 0-index to its position in the list
  dispatchUI: React.Dispatch<CacheReducerAction>;
}

export function Card({ card, listId, position, dispatchUI }: CardProps) {
  const [hoveringOverHeader, setHoveringOverHeader] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(card.name);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getSession } = useAuth<TrelloSession>("trello", trelloAuthStore);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setEditValue(card.name);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [card.name]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(card.name);
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
    setIsEditing(false);
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
          onClick={isEditing ? handleDelete : handleEdit}
          className={`edit-card-button ${hoveringOverHeader ? "visible" : ""}`}
        >
          {isEditing ? <RemoveIcon /> : <EditIcon />}
        </span>
      </div>

      {/* Card editor */}
      {isEditing ? (
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
    </div>
  );
}
