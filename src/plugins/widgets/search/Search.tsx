import React, { FC, useRef, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useKeyPress } from "../../../hooks";
import { getSuggestions, getWikipediaSuggestions, WikipediaSuggestionResult } from "./getSuggestions";
import Suggestions from "./Suggestions";
import { Props, defaultData } from "./types";
import { buildUrl, getSearchUrl, getSuggestUrl } from "./utils";
import "./Search.sass";

export const messages = defineMessages({
  placeholder: {
    id: "plugins.search.placeholder",
    description: "Placeholder text to show in the search box before typing",
    defaultMessage: "Type to search",
  },
});

const Search: FC<Props> = ({ data = defaultData }) => {
  const searchInput = useRef<HTMLInputElement>(null);
  const previousValue = useRef("");

  const [active, setActive] = useState<number>();
  const [suggestions, setSuggestions] = useState<(string | WikipediaSuggestionResult)[]>();

  const intl = useIntl();
  const placeholder = data.placeholderText || intl.formatMessage(messages.placeholder);

  const keyBind = data.keyBind ?? "G";
  useKeyPress(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if (searchInput.current) {
        searchInput.current.focus();
      }
    },
    [keyBind.toUpperCase(), keyBind.toLowerCase()],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    previousValue.current = event.target.value;

    if (data.suggestionsEngine === "wikipedia") {
      // Use Wikipedia API for suggestions
      const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(event.target.value)}&limit=10`;
      getWikipediaSuggestions(event.target.value, url).then((suggestions) => {
        setSuggestions(suggestions.slice(0, data.suggestionsQuantity));
        setActive(undefined);
      });
    } else if (BUILD_TARGET === "web") {
      const suggestUrl = getSuggestUrl(data.suggestionsEngine);
      if (suggestUrl) {
        getSuggestions(event.target.value, suggestUrl).then((suggestions) => {
          setSuggestions(suggestions.slice(0, data.suggestionsQuantity));
          setActive(undefined);
        });
      }
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions) {
      return;
    }

    event.preventDefault();

    switch (event.key) {

      case "ArrowUp": {
        const upTo = !active ? suggestions.length - 1 : active - 1;
        const upSuggestion = suggestions[upTo];
        searchInput.current!.value = typeof upSuggestion === "string" ? upSuggestion : upSuggestion.title;
        setActive(upTo);
        break;
      }


      case "ArrowDown": {
        const downTo =
          active === undefined || active === suggestions.length - 1
            ? 0
            : active + 1;
        const downSuggestion = suggestions[downTo];
        searchInput.current!.value = typeof downSuggestion === "string" ? downSuggestion : downSuggestion.title;
        setActive(downTo);
        break;
      }

      case "Escape":
        if (active) {
          setActive(undefined);
          searchInput.current!.value = previousValue.current;
        } else if (suggestions) {
          setSuggestions(undefined);
        }
        break;
    }
  };

  const handleSelect = (suggestion: string | WikipediaSuggestionResult) => {
    if (typeof suggestion === "string") {
      searchInput.current!.value = suggestion;
    } else {
      searchInput.current!.value = suggestion.title;
    }
    search();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search();
  };

  const search = () => {
    if (data.searchEngine == "default" && BUILD_TARGET != "web") {
      browser.search.query({ text: searchInput.current!.value });
      return;
    }
    window.location.assign(
      buildUrl(searchInput.current!.value, getSearchUrl(data.searchEngine, data.searchEngineCustom)),
    );
  };

  return (
    <form className="Search" onSubmit={handleSubmit}>
      <input
        autoFocus
        defaultValue=""
        placeholder={placeholder}
        ref={searchInput}
        tabIndex={1}
        type="text"
        onChange={handleChange}
        onKeyUp={handleKeyUp}
      />

      {suggestions && (
        <Suggestions
          active={active}
          setActive={setActive}
          suggestions={suggestions}
          onSelect={handleSelect}
        />
      )}
    </form>
  );
};

export default Search;
