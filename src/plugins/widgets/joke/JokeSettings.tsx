import React from "react";
import { FormattedMessage } from "react-intl";
import { MINUTES, HOURS } from "../../../utils";
import categories from "./categories";
import { Props, defaultData, JokeAPICategory } from "./types";
import { pluginMessages, timingMessages } from "../../../locales/messages";

function updateSelectedCategories(
  existingCategories: JokeAPICategory[],
  updatedCategory: JokeAPICategory,
  checked: boolean,
): JokeAPICategory[] {
  const isAnyCategoryChecked = updatedCategory === "any" && checked;
  const isLastItemBeingUnchecked = !checked && existingCategories.length === 1;

  if (isLastItemBeingUnchecked) {
    return existingCategories;
  }

  if (isAnyCategoryChecked) {
    return ["any"];
  }

  const categories = [...existingCategories];

  // Remove "any" if it exists
  const anyIndex = categories.indexOf("any");
  if (anyIndex !== -1) {
    categories.splice(anyIndex, 1);
  }

  if (checked) {
    if (!categories.includes(updatedCategory)) {
      categories.push(updatedCategory);
    }
  } else {
    const index = categories.indexOf(updatedCategory);
    if (index !== -1) {
      categories.splice(index, 1);
    }
  }

  return categories.length === 0 ? existingCategories : categories;
}

const JokeSettings: React.FC<Props> = ({ data = defaultData, setData }) => {
  return (
    <div className="JokeSettings">
      <h5>
        <FormattedMessage
          id="plugins.joke.dailyJoke"
          defaultMessage="Daily Joke"
          description="Daily Joke title"
        />
      </h5>

      <label>
        <FormattedMessage
          id="plugins.joke.showANewJoke"
          defaultMessage="Show a new joke"
          description="Show a new joke title"
        />
        <select
          value={data.timeout}
          onChange={(event) =>
            setData({ ...data, timeout: Number(event.target.value) })
          }
        >
          <option value={5 * MINUTES}>
            <FormattedMessage {...timingMessages.every5min} />
          </option>
          <option value={15 * MINUTES}>
            <FormattedMessage {...timingMessages.every15min} />
          </option>
          <option value={HOURS}>
            <FormattedMessage {...timingMessages.everyHour} />
          </option>
          <option value={24 * HOURS}>
            <FormattedMessage {...timingMessages.everyDay} />
          </option>
          <option value={7 * 24 * HOURS}>
            <FormattedMessage {...timingMessages.everyWeek} />
          </option>
        </select>
      </label>

      <label>
        <FormattedMessage
          id="plugins.joke.category"
          defaultMessage="Category"
          description="Category title"
        />
        {categories.map((category) => {
          return (
            <label key={category.key}>
              <input
                type="checkbox"
                checked={data.categories.includes(category.key)}
                onChange={(event) => {
                  const categories = updateSelectedCategories(
                    data.categories,
                    category.key,
                    event.target.checked,
                  );

                  setData({ ...data, categories });
                }}
              />{" "}
              <FormattedMessage
                id={category.name}
                defaultMessage={
                  category.key.charAt(0).toUpperCase() + category.key.slice(1)
                }
              />
            </label>
          );
        })}
      </label>

      <label>
        <FormattedMessage
          id="plugins.joke.keybind"
          defaultMessage="Reveal answer keybind"
          description="Reveal answer keybind title"
        />
        <input
          type="text"
          maxLength={1}
          onChange={(event) =>
            setData({ ...data, keyBind: event.target.value })
          }
          value={data.keyBind}
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.joke.maxLength"
          defaultMessage="Max preview length"
          description="Maximum length of joke to show on preview"
        />
        <input
          type="number"
          min="0"
          onChange={(event) =>
            setData({ ...data, maxPreviewLength: Number(event.target.value) })
          }
          placeholder="Maximum length of joke to show on preview"
          value={data.maxPreviewLength}
        />
      </label>

      <p>
        <FormattedMessage {...pluginMessages.poweredBy} />{" "}
        <a
          href="https://jokeapi.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          JokeAPI
        </a>
      </p>
    </div>
  );
};

export default JokeSettings;
