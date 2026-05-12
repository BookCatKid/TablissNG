import "./style.sass";

import { useState } from "react";

import useAuth from "../../../../../../hooks/useAuth";
import { CacheReducerAction } from "../../../cacheReducer";
import { trelloAuthStore } from "../../../stores/trelloAuthStore";
import { createItem, TrelloSession } from "../../../types";
import { addCardToList } from "../../../utils/api";

interface ItemCreatorFormProps {
  listId: string;
  dispatchUI: React.Dispatch<CacheReducerAction>;
  onFormSubmit: () => void;
}
export function ItemCreatorForm({
  listId,
  dispatchUI,
  onFormSubmit,
}: ItemCreatorFormProps) {
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
      const created = createItem(cleanedFormContent);
      dispatchUI({ type: "ADD", card: created, listId: listId });
      const actionSuccessful = await addCardToList(created, listId, session);

      if (!actionSuccessful) {
        dispatchUI({ type: "REMOVE_TOP", listId: listId });
      }
    }
  };

  return (
    <div className="item-creator-form-container">
      <textarea
        className="item-creator-form-text-input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={formContent}
      />
    </div>
  );
}
