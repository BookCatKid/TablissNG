import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";
import { DebounceInput } from "../../shared";

const GiphySettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="GiphySettings">
    <label>
      <FormattedMessage
        id="backgrounds.giphy.tag"
        defaultMessage="Tag"
        description="Tag title"
      />
      <DebounceInput
        type="text"
        value={data.tag}
        onChange={(value) => setData({ ...data, tag: value })}
        wait={500}
      />
    </label>
    <p className="info">
      <FormattedMessage
        id="backgrounds.giphy.tag.info"
        defaultMessage="Separate multiple tags with a comma"
        description="Tag info"
      />
    </p>

    <label>
      <input
        type="checkbox"
        checked={data.nsfw}
        onChange={() => setData({ ...data, nsfw: !data.nsfw })}
      />{" "}
      <FormattedMessage
        id="backgrounds.giphy.safeSearch"
        defaultMessage="Include NSFW content"
        description="Include NSFW content checkbox label"
      />
    </label>
  </div>
);

export default GiphySettings;
