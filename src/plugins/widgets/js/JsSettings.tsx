import React, { FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";
import { pluginMessages } from "../../../locales/messages";

const JsSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const [input, setInput] = useState(data.input);
  const handleSave = () => setData({ input });

  return (
    <div className="JsSettings">
      <label>
        <FormattedMessage
          id="plugins.js.jsSnippet"
          defaultMessage="JavaScript Snippet"
          description="JavaScript Snippet title"
        />
        <textarea
          rows={20}
          style={{ resize: "vertical", fontFamily: "monospace" }}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>

      <button onClick={handleSave} className="button button--primary">
        <FormattedMessage {...pluginMessages.apply} />
      </button>

      <p className="info">
        <FormattedMessage
          id="plugins.js.Warning"
          defaultMessage="Warning: this functionality is intended for advanced users. Custom
          scripts may break at any time. The snippet will run once after the
          dashboard has loaded. Be careful of persisting event listeners when
          editing the snippet."
          description="JavaScript warning title"
        />
      </p>
    </div>
  );
};

export default JsSettings;
