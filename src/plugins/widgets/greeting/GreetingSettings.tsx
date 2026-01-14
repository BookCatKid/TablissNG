import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";
import { pluginMessages } from "../../../locales/messages";

const GreetingSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="GreetingSettings">
    <label>
      <FormattedMessage {...pluginMessages.yourName} />
      <input
        type="text"
        value={data.name}
        onChange={(event) => setData({ name: event.target.value })}
      />
    </label>
  </div>
);

export default GreetingSettings;
