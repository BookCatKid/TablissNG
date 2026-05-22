import "./style.sass";

import { useState } from "react";

import useAuth from "../../../../../../hooks/useAuth";
import { CacheReducerAction } from "../../../reducers";
import { trelloAuthStore } from "../../../stores/trelloAuthStore";
import { createCard, TrelloSession } from "../../../types";
import { addCardToList } from "../../../utils/api";

interface CardCreatorFormProps {
  listId: string;
  dispatchUI: React.Dispatch<CacheReducerAction>;
  onFormSubmit: () => void;
}
export function CardCreatorForm({
  listId,
  dispatchUI,
  onFormSubmit,
}: CardCreatorFormProps) {
  const [formContent, setFormContent] = useState<string>("");
  const { getSession } = useAuth<TrelloSession>("trello", trelloAuthStore);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormContent(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter should create the card. Cards should not have any newlines
    if (e.key === "Enter" && formContent !== "") {
      e.preventDefault();
      setFormContent("");
      onFormSubmit();
      const session = await getSession();

      if (!session) return;
      const cleanedFormContent = formContent.replace(/(\r\n|\n|\r)/gm, "");
      const created = createCard(cleanedFormContent);
      dispatchUI({ type: "ADD_CARD", card: created, listId: listId });
      const actionSuccessful = await addCardToList(created, listId, session);

      if (!actionSuccessful) {
        dispatchUI({ type: "DELETE_CARD", listId: listId, cardId: created.id });
      }
    }
  };

  return (
    <div className="card-creator-form-container">
      <textarea
        className="card-creator-form-text-input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={formContent}
      />
    </div>
  );
}
