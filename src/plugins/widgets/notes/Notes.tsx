import React from "react";
import { API } from "../../types";
import { Data, defaultData } from "./data";
import { sanitizeRichText } from "../../../utils/richText";
import Input from "./Input";
import ReactMarkdown from "react-markdown";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";
import { useKeyPress } from "../../../hooks";
import "./Notes.sass";

const Notes: React.FC<API<Data>> = ({ data = defaultData, setData }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const keyBind = data.keyBind ?? "N";
  useKeyPress(
    (event: KeyboardEvent) => {
      event.preventDefault();
      setIsEditing(true);
    },
    [keyBind.toUpperCase(), keyBind.toLowerCase()],
  );

  const allowInlineEditing = !data.richTextEnabled;
  const renderPlaceholder = () => (
    <div
      className="placeholder"
      style={{
        display: "flex",
        justifyContent: data.iconAlign || "flex-start",
      }}
    >
      {data.placeholderStyle === "icon" ? (
        <Icon icon="feather:edit" />
      ) : (
        <>
          <Icon icon="feather:edit-3" />
          <span>
            <FormattedMessage
              id="plugins.notes.clickToAdd"
              defaultMessage="Click to add note"
            />
          </span>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    if (!data.notes[0].contents) {
      return renderPlaceholder();
    }
    if (data.markdownEnabled && !data.richTextEnabled) {
      return <ReactMarkdown>{data.notes[0].contents}</ReactMarkdown>;
    }
    if (data.richTextEnabled) {
      return (
        <div
          className="notes-rich"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(data.notes[0].contents) }}
        />
      );
    }
    return data.notes[0].contents;
  };

  return (
    <div className="Notes" style={{ textAlign: data.textAlign || "left" }}>
      <div>
        {allowInlineEditing && isEditing ? (
          <Input
            value={data.notes[0].contents}
            onChange={(contents) => {
              setData({ ...data, notes: [{ contents }] });
            }}
            onBlur={() => setIsEditing(false)}
          />
        ) : (
          <div
            onClick={() => {
              if (allowInlineEditing) {
                setIsEditing(true);
              }
            }}
            style={{ cursor: allowInlineEditing ? "pointer" : "default" }}
            className={data.markdownEnabled ? "markdown-content" : ""}
          >
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
