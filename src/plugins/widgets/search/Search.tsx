import React, { FC, useRef, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import { useKeyPress } from "../../../hooks";
import {
  getSuggestions,
  getWikipediaSuggestions,
  WikipediaSuggestionResult,
} from "./getSuggestions";
import Suggestions from "./Suggestions";
import { Props, defaultData } from "./types";
import { buildUrl, getSearchUrl, getSuggestUrl } from "./utils";
import { isSpecialUrl } from "../../../utils";
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
  const [suggestions, setSuggestions] =
    useState<(string | WikipediaSuggestionResult)[]>();

  const intl = useIntl();
  const placeholder =
    data.placeholderText || intl.formatMessage(messages.placeholder);

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
        searchInput.current!.value =
          typeof upSuggestion === "string" ? upSuggestion : upSuggestion.title;
        setActive(upTo);
        break;
      }

      case "ArrowDown": {
        const downTo =
          active === undefined || active === suggestions.length - 1
            ? 0
            : active + 1;
        const downSuggestion = suggestions[downTo];
        searchInput.current!.value =
          typeof downSuggestion === "string"
            ? downSuggestion
            : downSuggestion.title;
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
    const query = searchInput.current!.value;
    const url = buildUrl(
      query,
      getSearchUrl(data.searchEngine, data.searchEngineCustom),
    );

    // If it's a special URL, handle it regardless of search engine
    if (isSpecialUrl(url)) {
      if (BUILD_TARGET === "firefox") {
        alert(
          "Sorry, Firefox restricts access to this type of URL. This is completely out of my control.",
        );
        return;
      }

      if (BUILD_TARGET !== "web") {
        browser.tabs.update({
          url,
        });
      } else {
        // Web build can just redirect
        window.location.assign(url);
      }
      return;
    }

    // If it's the default search engine and not a special URL, use browser search
    if (data.searchEngine === "default" && BUILD_TARGET !== "web") {
      browser.search.query({ text: query });
      return;
    }

    // Regular search or URL for other cases
    window.location.assign(url);
  };

  return (
    <form
      className={`Search ${data.style ? `style-${data.style}` : ""}`}
      style={{
        width: data.overrideWidth ? `${data.customWidth || 400}px` : undefined,
      }}
      onSubmit={handleSubmit}
    >
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
      {(data.style === "transparent-rounded" ||
        data.style === "minimal-outlined") && (
        <button className="search-submit" type="submit">
          <Icon icon="feather:search" />
        </button>
      )}

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
