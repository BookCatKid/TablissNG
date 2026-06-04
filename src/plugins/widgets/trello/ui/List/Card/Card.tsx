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
import {
  Card as CardType,
  colourPalette,
  Label,
  TrelloSession,
} from "../../../types";
import {
  addOrRemoveLabel,
  deleteCard,
  updateCardName,
} from "../../../utils/api";
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
  const [labels, setLabels] = useState<Label[]>(card.labels);
  const labelsRef = useRef<Label[]>(card.labels);
  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);
  const [hovering, setHovering] = useState<boolean>(false);

  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const [isEditingLabels, setIsEditingLabels] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(card.name);
  const isSelected = isEditingContent || isEditingLabels;
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

  // Set tag position when opened to align next to card
  useEffect(() => {
    if (isEditingLabels && selfRef.current) {
      const r = selfRef.current.getBoundingClientRect();
      setTagPosition({ top: r.top, left: r.right + 8 });
    }
  }, [isEditingLabels]);

  // Reposition tag editor on scroll/resize
  useEffect(() => {
    if (!isEditingLabels) return;
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
  }, [isEditingLabels]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target as Node) &&
        selfRef.current &&
        !selfRef.current.contains(e.target as Node)
      ) {
        setIsEditingLabels(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditingLabels]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditingContent(false);
        setEditValue(card.name);
        setIsEditingLabels(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [card.name]);

  const handleEdit = () => {
    setIsEditingContent(true);
    setEditValue(card.name);
  };

  const handleEditLabels = () => {
    setIsEditingLabels(true);
  };

  // Functions to to alter UI

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

    setIsEditingContent(false);

    const actionSuccessful = await updateCardName(card.id, cleaned, session);

    if (!actionSuccessful) {
      setEditValue(originalName);
      dispatchUI({
        type: "EDIT_CARD_NAME",
        cardId: card.id,
        listId,
        name: originalName,
      });
      setIsEditingContent(true);
    }
  };

  const handleNewSelectedLabels = async (
    label: Label,
    operation: "ADD" | "REMOVE",
  ) => {
    const session = await getSession();
    if (!session) return;

    const snapshot = labelsRef.current;
    const updatedLabels: Label[] =
      operation === "ADD"
        ? [...snapshot, label]
        : snapshot.filter((l) => l.id !== label.id);
    labelsRef.current = updatedLabels;
    setLabels(updatedLabels);

    const actionSuccessful = await addOrRemoveLabel(
      card.id,
      label.id,
      operation,
      session,
    );

    if (!actionSuccessful) {
      const correctedLabels: Label[] =
        operation === "ADD"
          ? labelsRef.current.filter((l) => l.id !== label.id)
          : [...labelsRef.current, label];
      labelsRef.current = correctedLabels;
      setLabels(correctedLabels);
      dispatchUI({
        type: "UPDATE_CARD_LABELS",
        cardId: card.id,
        listId,
        labels: correctedLabels,
      });
    } else {
      dispatchUI({
        type: "UPDATE_CARD_LABELS",
        cardId: card.id,
        listId,
        labels: labelsRef.current,
      });
    }
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

  let stateClasses = "";
  if (isSelected || hovering) {
    stateClasses += " selected ";
  }

  if (hovering && !isSelected) {
    stateClasses += " hovered ";
  }

  return (
    <div
      ref={selfRef}
      className={`card-content-container ${stateClasses}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="card-header">
        <div className="card-labels-container">
          {labels.map((l) => (
            <div
              key={l.id}
              className="card-label"
              style={{
                width: "2.5rem",
                height: "0.26rem",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
                background: colourPalette[l.colour],
              }}
            />
          ))}
        </div>
        <span
          className={`
            edit-card-buttons
            ${hovering ? "visible" : ""}`}
        >
          {isEditingContent ? (
            <span
              onClick={isEditingLabels ? undefined : handleDelete}
              className={`icon ${isEditingLabels ? " disabled" : ""}`}
            >
              <RemoveIcon />
            </span>
          ) : (
            <span
              onClick={isEditingLabels ? undefined : handleEdit}
              className={`icon ${isEditingLabels ? " disabled" : ""}`}
            >
              <EditIcon />
            </span>
          )}
          <span
            onClick={isEditingContent ? undefined : handleEditLabels}
            className={`icon ${isEditingContent ? " disabled" : ""}`}
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

      {isEditingLabels &&
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
            <LabelsForm
              onSelectedChange={handleNewSelectedLabels}
              labelsOnCard={labels}
              boardId={boardId}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
