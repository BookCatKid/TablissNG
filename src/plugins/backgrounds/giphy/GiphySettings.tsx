import { FC } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { backgroundMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import BaseSettings from "../base/BaseSettings";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  searchPlaceholder: {
    id: "backgrounds.giphy.search.placeholder",
    defaultMessage: "Try 'nature' or 'trippy'...",
    description: "Placeholder text for Giphy search input",
  },
});

const GiphySettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="GiphySettings">
      <BaseSettings
        data={data}
        setData={setData}
        title={
          <FormattedMessage
            id="backgrounds.giphy.showNewGif"
            defaultMessage="Show a new GIF"
          />
        }
      />

      <label>
        <input
          type="radio"
          checked={data.by === "trending"}
          onChange={() => setData({ ...data, by: "trending" })}
        />{" "}
        <FormattedMessage
          id="backgrounds.giphy.trending"
          defaultMessage="Trending"
          description="Trending mode for Giphy"
        />
      </label>

      <label>
        <input
          type="radio"
          checked={data.by === "random" || !data.by} // Old data would have by undefined and old default was random
          onChange={() => setData({ ...data, by: "random" })}
        />{" "}
        <FormattedMessage
          id="backgrounds.giphy.random"
          defaultMessage="Random"
          description="Random mode for Giphy"
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

      {data.by !== "trending" && (
        <>
          <label>
            <FormattedMessage {...backgroundMessages.searchTerm} />
            <DebounceInput
              type="text"
              value={data.tag}
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
              onChange={(value) => setData({ ...data, tag: value })}
              wait={500}
            />
          </label>
          <p className="info">
            <FormattedMessage
              id="backgrounds.giphy.search.info"
              defaultMessage="Separate multiple terms with a comma"
              description="Search info"
            />
          </p>
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={data.nsfw}
          onChange={(event) => setData({ ...data, nsfw: event.target.checked })}
        />{" "}
        <FormattedMessage
          id="backgrounds.giphy.nsfw"
          defaultMessage="Include NSFW content"
          description="Label for Giphy NSFW toggle"
        />
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

export default GiphySettings;
