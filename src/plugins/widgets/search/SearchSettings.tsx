import React, { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { engines } from "./engines";
import { Props, defaultData, SEARCH_ENGINE_CUSTOM, SearchStyle } from "./types";
import { messages } from "./Search";

const SearchSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="SearchSettings">
      <label>
        <FormattedMessage
          id="plugins.search.provider"
          defaultMessage="Search Provider"
          description="Search Provider title"
        />
        <select
          onChange={(event) =>
            setData({ ...data, searchEngine: event.target.value })
          }
          value={data.searchEngine}
        >
          {BUILD_TARGET != "web" && (
            <option key="default" value="default">
              <FormattedMessage
                id="plugins.search.default"
                defaultMessage="Browser Default"
                description="Default search engine option"
              />
            </option>
          )}
          {engines.map(({ key, name }) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
          <option key="custom" value={SEARCH_ENGINE_CUSTOM}>
            <FormattedMessage
              id="plugins.search.custom"
              defaultMessage="Custom"
              description="Custom search engine option"
            />
          </option>
        </select>
      </label>

      {data.searchEngine === SEARCH_ENGINE_CUSTOM && (
        <>
          <label>
            <FormattedMessage
              id="plugins.search.customProvider"
              defaultMessage="Custom Search Provider"
              description="Custom search provider input label"
            />
            <input
              type="text"
              value={data.searchEngineCustom}
              onChange={(event) =>
                setData({
                  ...data,
                  searchEngineCustom: event.target.value,
                })
              }
            />
          </label>

          <p className="info">
            <FormattedMessage
              id="plugins.search.customWarning"
              defaultMessage="Warning: This functionality is intended for advanced users. {searchTerms} is replaced by the entered search term."
              description="Warning about using custom search providers"
            />
          </p>
        </>
      )}

      <label>
        <FormattedMessage
          id="plugins.search.placeholderLabel"
          defaultMessage="Placeholder Text"
          description="Search placeholder text input label"
        />
        <input
          type="text"
          value={data.placeholderText}
          placeholder={intl.formatMessage(messages.placeholder)}
          onChange={(event) =>
            setData({
              ...data,
              placeholderText: event.target.value,
            })
          }
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.search.style"
          defaultMessage="Search Style"
          description="Search Style title"
        />
        <select
          onChange={(event) =>
            setData({ ...data, style: event.target.value as SearchStyle })
          }
          value={data.style ?? "default"}
        >
          <option value="default">
            <FormattedMessage
              id="plugins.search.style.default"
              defaultMessage="Default"
              description="Label for the default search style"
            />
          </option>
          <option value="transparent-rounded">
            <FormattedMessage
              id="plugins.search.style.transparentRounded"
              defaultMessage="Transparent Rounded"
              description="Label for the transparent rounded search style"
            />
          </option>
          <option value="minimal-outlined">
            <FormattedMessage
              id="plugins.search.style.minimalOutlined"
              defaultMessage="Minimal Outlined"
              description="Label for the minimal outlined search style"
            />
          </option>
        </select>
      </label>

      <label>
        <FormattedMessage
          id="plugins.search.keybind"
          defaultMessage="Search keybind"
          description="Search keybind title"
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

      <label className="checkbox">
        <input
          type="checkbox"
          checked={data.overrideWidth}
          onChange={(event) =>
            setData({ ...data, overrideWidth: event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.search.overrideWidth"
          defaultMessage="Override search bar width"
          description="Checkbox label to override search bar width"
        />
      </label>

      {data.overrideWidth && (
        <label>
          <FormattedMessage
            id="plugins.search.customWidth"
            defaultMessage="Custom Width (px)"
            description="Input label for custom search bar width"
          />
          <input
            type="number"
            value={data.customWidth ?? 400}
            onChange={(event) =>
              setData({
                ...data,
                customWidth: Number(event.target.value),
              })
            }
          />
        </label>
      )}

      <label>
        <FormattedMessage
          id="plugins.search.suggestionsProvider"
          defaultMessage="Suggestions Provider"
          description="Suggestions Provider title"
        />
        <select
          onChange={(event) =>
            setData({ ...data, suggestionsEngine: event.target.value })
          }
          value={data.suggestionsEngine}
        >
          <option key="off" value="">
            <FormattedMessage
              id="plugins.off"
              defaultMessage="Off"
              description="Off title"
            />
          </option>
          {BUILD_TARGET === "web" ? (
            engines
              .filter(({ suggest_url }) => Boolean(suggest_url))
              .map(({ key, name }) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))
          ) : (
            <option key="wikipedia" value="wikipedia">
              Wikipedia
            </option>
          )}
        </select>
      </label>

      {data.suggestionsEngine && (
        <label>
          <FormattedMessage
            id="plugins.search.suggestionsQuanitity"
            defaultMessage="Suggestion Quanitity"
            description="Suggestion Quanitity title"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={data.suggestionsQuantity}
            onChange={(event) =>
              setData({
                ...data,
                suggestionsQuantity: Number(event.target.value),
              })
            }
          />
        </label>
      )}
    </div>
  );
};

export default SearchSettings;
