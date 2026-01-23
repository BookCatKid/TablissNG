import React, { FC } from "react";
import "./Suggestions.sass";
import type { WikipediaSuggestionResult } from "./getSuggestions";

type Props = {
  active?: number;
  setActive: (active?: number) => void;
  suggestions: (string | WikipediaSuggestionResult)[];
  onSelect: (suggestion: string | WikipediaSuggestionResult) => void;
};

const Suggestions: FC<Props> = ({
  active,
  setActive,
  suggestions,
  onSelect,
}) => {
  return (
    <div className="Suggestions">
      {suggestions.map((suggestion, index) => {
        if (typeof suggestion === "string") {
          return (
            <input
              type="button"
              key={index}
              className={index === active ? "active" : ""}
              value={suggestion}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(undefined)}
            />
          );
        } else {
          return (
            <div
              key={index}
              className={
                "suggestion-item" + (index === active ? " active" : "")
              }
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(undefined)}
              tabIndex={0}
              role="button"
            >
              {suggestion.thumbnailUrl && (
                <img
                  src={suggestion.thumbnailUrl}
                  alt=""
                  className="suggestion-thumb"
                />
              )}
              <div className="suggestion-content">
                <div className="suggestion-title">{suggestion.title}</div>
                {suggestion.description && (
                  <div className="suggestion-desc">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Suggestions;
