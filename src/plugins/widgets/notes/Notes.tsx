import "./Notes.sass";

import { Icon } from "@iconify/react";
import { type FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useKeyPress } from "../../../hooks";
import { sanitizeRichText } from "../../../utils/richText";
import { API } from "../../types";
import { Data, defaultData } from "./data";
import Input from "./Input";

const Notes: FC<API<Data>> = ({ data = defaultData, setData }) => {
  const [isEditing, setIsEditing] = useState(false);

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
              description="Placeholder shown when the notes widget has no note content"
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
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(data.notes[0].contents),
          }}
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
            className={
              data.markdownEnabled && !data.richTextEnabled
                ? "markdown-content"
                : ""
            }
          >
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
