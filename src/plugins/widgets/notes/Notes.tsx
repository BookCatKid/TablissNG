import "./Notes.sass";

import { Icon } from "@iconify/react";
import { type FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useKeyPress } from "../../../hooks";
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

  return (
    <div className="Notes" style={{ textAlign: data.textAlign || "left" }}>
      <div>
        {isEditing ? (
          <Input
            value={data.notes[0].contents}
            onChange={(contents) => {
              setData({ ...data, notes: [{ contents }] });
            }}
            onBlur={() => setIsEditing(false)}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{ cursor: "pointer" }}
            className={data.markdownEnabled ? "markdown-content" : ""}
          >
            {data.notes[0].contents ? (
              data.markdownEnabled ? (
                <ReactMarkdown>{data.notes[0].contents}</ReactMarkdown>
              ) : (
                data.notes[0].contents
              )
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
