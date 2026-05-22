import { FC } from "react";
import { FormattedMessage } from "react-intl";

import { pluginMessages } from "../../../locales/messages";
import { defaultData, Props } from "./types";

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
