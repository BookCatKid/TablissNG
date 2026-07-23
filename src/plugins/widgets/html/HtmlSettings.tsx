import { FC, useState } from "react";
import { FormattedMessage } from "react-intl";

import { pluginMessages } from "../../../locales/messages";
import { defaultData, Props } from "./types";

const HtmlSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const [input, setInput] = useState(data.input);
  const [allowJavaScript, setAllowJavaScript] = useState(
    Boolean(data.allowJavaScript),
  );

  const handleSave = () => {
    // Web ignores allowJavaScript and always uses in-page HTML (legacy).
    if (BUILD_TARGET === "web") {
      setData({ input, allowJavaScript: data.allowJavaScript ?? false });
      return;
    }
    setData({ input, allowJavaScript });
  };

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

      {BUILD_TARGET !== "web" && (
        <label>
          <input
            type="checkbox"
            checked={allowJavaScript}
            onChange={(event) => setAllowJavaScript(event.target.checked)}
          />{" "}
          <FormattedMessage
            id="plugins.html.allowJavaScript"
            defaultMessage="Allow JavaScript"
            description="Checkbox to enable JS execution in Custom HTML widget"
          />
        </label>
      )}

      <p className="info">
        <FormattedMessage
          id="plugins.html.warning"
          defaultMessage="Warning: This functionality is intended for advanced users."
          description="Warning message for HTML widget"
        />
        {BUILD_TARGET !== "web" &&
          (allowJavaScript ? (
            <>
              {" "}
              <FormattedMessage
                id="plugins.html.jsEnabledWarning"
                defaultMessage="JavaScript runs in an isolated sandbox. Only enable for HTML you trust. Scripts cannot access Tabliss settings or extension APIs."
                description="Security note when JS is enabled for Custom HTML"
              />
            </>
          ) : (
            <>
              {" "}
              <FormattedMessage
                id="plugins.html.jsWarning"
                defaultMessage="JavaScript will not be executed."
                description="Warning about JavaScript execution"
              />
            </>
          ))}
      </p>

      <button className="button button--primary" onClick={handleSave}>
        <FormattedMessage {...pluginMessages.apply} />
      </button>
    </div>
  );
};

export default HtmlSettings;
