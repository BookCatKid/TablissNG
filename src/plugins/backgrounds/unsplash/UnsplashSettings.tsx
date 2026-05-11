import { type FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import BaseSettings from "../base/BaseSettings";
import Select from "./Select/Select";
import topics from "./topics.json";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  searchTermPlaceholder: {
    id: "backgrounds.unsplash.searchTerm.placeholder",
    defaultMessage: "Try landscapes or animals...",
    description: "Placeholder text for search term input",
  },
  collectionIdPlaceholder: {
    id: "backgrounds.unsplash.collectionId.placeholder",
    defaultMessage: "Collection ID number",
    description: "Placeholder text for collection ID input",
  },
  topicsPlaceholder: {
    id: "backgrounds.unsplash.topics.placeholder",
    defaultMessage: "Select topics...",
    description: "Placeholder text for the unsplash topics multi-select input",
  },
});

const UnsplashSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();
  return (
    <div className="UnsplashSettings">
      <BaseSettings data={data} setData={setData} />

      <label>
        <input
          type="radio"
          checked={data.by === "official"}
          onChange={() => setData({ ...data, by: "official" })}
        />{" "}
        <FormattedMessage
          id="backgrounds.unsplash.officialCollection"
          defaultMessage="Official Collection"
          description="Official Collection title"
        />
      </label>

      <label>
        <input
          type="radio"
          checked={data.by === "topics"}
          onChange={() => setData({ ...data, by: "topics" })}
        />{" "}
        <FormattedMessage
          id="backgrounds.unsplash.topic"
          defaultMessage="Topic"
          description="Unsplash label for searching by topics"
        />
      </label>

      <label>
        <input
          type="radio"
          checked={data.by === "search"}
          onChange={() => setData({ ...data, by: "search" })}
        />{" "}
        <FormattedMessage {...backgroundMessages.search} />
      </label>

      <label>
        <input
          type="radio"
          checked={data.by === "collections"}
          onChange={() => setData({ ...data, by: "collections" })}
        />{" "}
        <FormattedMessage
          id="backgrounds.unsplash.collection"
          defaultMessage="Collection"
          description="Collection title"
        />
      </label>

      {data.by === "topics" && (
        <label>
          <FormattedMessage
            id="backgrounds.unsplash.topics"
            defaultMessage="Topics"
            description="Unsplash label for topic multiselect"
          />
          <Select
            options={topics.map((topic) => ({
              value: topic.id,
              label: topic.title,
            }))}
            values={topics
              .map((topic) => ({ value: topic.id, label: topic.title }))
              .filter((topic) => data.topics.includes(topic.value))}
            onChange={(selected) => {
              setData({
                ...data,
                topics: selected.map((item) => item.value),
              });
            }}
            searchable
            dropdownHeight="300px"
            placeholder={intl.formatMessage(messages.topicsPlaceholder)}
            style={{ marginTop: "0.5em" }}
          />
          <i>
            <FormattedMessage
              id="backgrounds.unsplash.topics.help"
              defaultMessage="Select one or more topics"
              description="Help text for topic selection"
            />
          </i>
        </label>
      )}

      {data.by === "search" && (
        <>
          <label>
            <FormattedMessage {...backgroundMessages.searchTerm} />
            <DebounceInput
              type="text"
              value={data.search}
              placeholder={intl.formatMessage(messages.searchTermPlaceholder)}
              onChange={(value) => setData({ ...data, search: value })}
              wait={500}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(event) =>
                setData({ ...data, featured: event.target.checked })
              }
            />{" "}
            <FormattedMessage
              id="backgrounds.unsplash.onlyFeaturedImages"
              defaultMessage="Only featured images"
              description="Only featured images title"
            />
          </label>
        </>
      )}

      {data.by === "collections" && (
        <label>
          <FormattedMessage
            id="backgrounds.unsplash.collectionid"
            defaultMessage="Collection"
            description="Collection id input title"
          />

          <DebounceInput
            type="text"
            value={data.collections}
            placeholder={intl.formatMessage(messages.collectionIdPlaceholder)}
            onChange={(value) => setData({ ...data, collections: value })}
            wait={500}
          />
        </label>
      )}

      <label>
        <FormattedMessage
          id="backgrounds.unsplash.locationSource"
          defaultMessage="Location On-Click Source"
          description="Label for selecting where location clicks go to"
        />
        <select
          value={data.locationSource}
          onChange={(event) =>
            setData({ ...data, locationSource: event.target.value })
          }
        >
          <option value="google-maps">
            <FormattedMessage
              id="backgrounds.unsplash.locationSource.googleMaps"
              defaultMessage="Google Maps"
              description="Google Maps option for location source"
            />
          </option>
          <option value="google">
            <FormattedMessage
              id="backgrounds.unsplash.locationSource.google"
              defaultMessage="Google Search"
              description="Google Search option for location source"
            />
          </option>
          <option value="duckduckgo">
            <FormattedMessage
              id="backgrounds.unsplash.locationSource.duckduckgo"
              defaultMessage="DuckDuckGo Search"
              description="DuckDuckGo Search option for location source"
            />
          </option>
          <option value="unsplash">
            <FormattedMessage
              id="backgrounds.unsplash.locationSource.unsplash"
              defaultMessage="Unsplash Photos"
              description="Unsplash Photos option for location source"
            />
          </option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showTitle}
          onChange={(event) =>
            setData({ ...data, showTitle: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...backgroundMessages.showTitle} />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showControls}
          onChange={(event) =>
            setData({ ...data, showControls: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...backgroundMessages.showControls} />
      </label>
    </div>
  );
};

export default UnsplashSettings;
