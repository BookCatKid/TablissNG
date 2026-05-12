import "./style.sass";

import { useState } from "react";

import { CacheReducerAction } from "../../../cacheReducer";

interface ItemCreatorFormProps {
  dispatchUI: React.Dispatch<CacheReducerAction>;
}
export function ItemCreatorForm({ dispatchUI }: ItemCreatorFormProps) {
  const [formContent, setFormContent] = useState<string>("");
  const createItemFromForm = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Create item
  };

  return (
    <div className="item-creator-form-container">
      <form onSubmit={createItemFromForm}>
        <input
          className="item-creator-form-text-input"
          onChange={(e) => setFormContent(e.target.value)}
          value={formContent}
          type="text"
        />
      </form>
    </div>
  );
}
