import React from "react";
import { FormattedMessage } from "react-intl";
import { API } from "../../types";
import { Data, defaultData } from "./data";
import { Icon, IconButton } from "../../../views/shared";
import "./Notes.sass";

const alignments = [
  {
    value: "left",
    icon: "align-left",
  },
  {
    value: "center",
    icon: "align-center",
  },
  {
    value: "right",
    icon: "align-right",
  },
] as const;

const NotesSettings: React.FC<API<Data>> = ({
  data = defaultData,
  setData,
}) => {
  return (
    <div className="NotesSettings">
      <label>
        <input
          type="checkbox"
          checked={data.markdownEnabled}
          onChange={(e) =>
            setData({ ...data, markdownEnabled: e.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.notes.enableMarkdown"
          defaultMessage="Enable Markdown formatting"
        />
      </label>

      <div>
        <label>
          <FormattedMessage
            id="plugins.notes.textAlignment"
            defaultMessage="Text Alignment"
          />
        </label>
        <div className="alignment">
          {alignments.map((alignment) => (
            <IconButton
              key={alignment.value}
              onClick={() => setData({ ...data, textAlign: alignment.value })}
              primary={data.textAlign === alignment.value}
            >
              <Icon name={alignment.icon} />
            </IconButton>
          ))}
        </div>
      </div>

      <div>
        <label>Icon Alignment</label>
        <div className="alignment">
          {alignments.map((alignment) => (
            <IconButton
              key={alignment.value}
              onClick={() => setData({ ...data, iconAlign: alignment.value })}
              primary={data.iconAlign === alignment.value}
            >
              <Icon name={alignment.icon} />
            </IconButton>
          ))}
        </div>
      </div>

      <div>
        <label>Placeholder Style</label>
        <div className="alignment">
          <IconButton
            onClick={() => setData({ ...data, placeholderStyle: "icon" })}
            primary={data.placeholderStyle === "icon"}
          >
            <Icon name="edit" />
          </IconButton>
          <IconButton
            onClick={() => setData({ ...data, placeholderStyle: "text" })}
            primary={data.placeholderStyle === "text"}
          >
            <Icon name="edit-3" />
          </IconButton>
        </div>
      </div>

      <label>
        <FormattedMessage
          id="plugins.notes.keybind"
          defaultMessage="Notes keybind"
          description="Notes keybind title"
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
    </div>
  );
};

export default NotesSettings;
