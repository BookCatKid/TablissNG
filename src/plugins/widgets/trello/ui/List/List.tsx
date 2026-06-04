import "./style.sass";

import { useContext, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ExpandIcon } from "../../../../../views/shared";
import { Spinner } from "../../../../shared";
import { CacheReducerAction } from "../../reducers";
import { Card } from "../../types";
import {
  DoubleDropZone,
  DragContext,
  DraggableCard,
  DropGuide,
  DropZone,
} from "../Drag";
import { Card as CardComponent } from "./Card";
import { CardCreatorForm } from "./CardCreatorForm";

interface ListComponentProps {
  header: string;
  boardId: string;
  listId: string;
  cards: Card[];
  loading: boolean | undefined;
  dispatchUI: React.Dispatch<CacheReducerAction>;
}

export function List({
  header,
  boardId,
  listId,
  cards,
  loading,
  dispatchUI,
}: ListComponentProps) {
  const context = useContext(DragContext);
  const cardCreatorRef = useRef<HTMLTextAreaElement>(null);
  const [hoveringOverHeader, setHoveringOverHeader] = useState<boolean>(false);
  const [cardCreatorOpen, setCardCreatorOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        cardCreatorRef.current &&
        !cardCreatorRef.current.contains(e.target as Node)
      ) {
        setCardCreatorOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCardCreatorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!context) {
    return null;
  }

  const { isDragging, dragCardId } = context;
  const openCardCreator = () => {
    setCardCreatorOpen(true);
  };

  return (
    <div className="list">
      <div
        className="list-header-container"
        onMouseEnter={() => setHoveringOverHeader(true)}
        onMouseLeave={() => setHoveringOverHeader(false)}
      >
        <h3 className="list-header">{header}</h3>
        <span
          onClick={() => openCardCreator()}
          className={`add-card-button ${hoveringOverHeader && !cardCreatorOpen ? "visible" : ""}`}
        >
          <ExpandIcon />
          <FormattedMessage
            id="plugins.trello.addCard"
            defaultMessage="Add a card"
            description="Add a card"
          />
        </span>
      </div>
      {loading || !cards ? (
        <div className="list-loader-container">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="list-card-container">
          {cardCreatorOpen && (
            <CardCreatorForm
              listId={listId}
              selfRef={cardCreatorRef}
              dispatchUI={dispatchUI}
              onFormSubmit={() => setCardCreatorOpen(false)}
            />
          )}
          {cards.map((card, i) => (
            <DoubleDropZone
              key={card.id}
              previousId={`list-${listId}-card-${i}`}
              nextId={`list-${listId}-card-${i + 1}`}
              dropType="ITEM"
              remember
            >
              <DropGuide dropType="ITEM" dropId={`list-${listId}-card-${i}`} />
              <DraggableCard
                dragId={`list-${listId}-card-${i}`}
                dragType="ITEM"
                className={
                  isDragging &&
                  dragCardId === `list-${listId}-card-${i}` &&
                  "hide-list-card"
                }
              >
                <CardComponent
                  position={i}
                  key={card.id}
                  card={card}
                  listId={listId}
                  boardId={boardId}
                  dispatchUI={dispatchUI}
                />
              </DraggableCard>
            </DoubleDropZone>
          ))}
          {/* allow placing cards at the end of the list */}
          <DropZone
            dropId={`list-${listId}-card-${cards.length}`}
            dropType="ITEM"
            style={{ minHeight: "4rem" }}
          >
            <DropGuide
              dropType="ITEM"
              dropId={`list-${listId}-card-${cards.length}`}
            />
          </DropZone>
        </div>
      )}
    </div>
  );
}
