import React, { FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";
import { pluginMessages } from "../../../locales/messages";

const HtmlSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const [input, setInput] = useState(data.input);
  const handleSave = () => setData({ input });

  return (
    <div className="HtmlSettings">
      <label>
        <FormattedMessage
          id="plugins.html.snippet"
          defaultMessage="HTML Snippet"
          description="Label for HTML input field"
        />
        <textarea
          rows={20}
          style={{ resize: "vertical", fontFamily: "monospace" }}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>

      <p className="info">
        <FormattedMessage
          id="plugins.html.warning"
          defaultMessage="Warning: This functionality is intended for advanced users."
          description="Warning message for HTML widget"
        />
        {BUILD_TARGET !== "web" && (
          <>
            &nbsp;
            <FormattedMessage
              id="plugins.html.jsWarning"
              defaultMessage="JavaScript will not be executed."
              description="Warning about JavaScript execution"
            />
          </>
        )}
      </p>

      <button className="button button--primary" onClick={handleSave}>
        <FormattedMessage {...pluginMessages.apply} />
      </button>
    </div>
  );
};

export default HtmlSettings;
