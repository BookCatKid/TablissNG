import React from "react";
import { FormattedMessage } from "react-intl";
import { DebounceInput } from "../../shared";
import { defaultData, Props } from "./types";

const OnlineSettings: React.FC<Props> = ({ data = defaultData, setData }) => (
  <div className="OnlineSettings">
    <label>
      <FormattedMessage
        id="backgrounds.online.url"
        defaultMessage="Image URL"
        description="Image URL title"
      />
      <DebounceInput
        type="text"
        value={data.url}
        onChange={(value) => setData({ url: value })}
        wait={1000}
      />
    </label>
  </div>
);

export default OnlineSettings;
