import React, { FC } from "react";
import { sanitizeRichText } from "../../../utils/richText";
import { Props, defaultData } from "./types";

const Message: FC<Props> = ({ data = defaultData }) => {
  const content = data.messages?.[0] ?? "";
  const useRich = Boolean(data.richTextEnabled);

  return (
    <div className="Message">
      {useRich ? (
        <div
          className="message-rich"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
        />
      ) : (
        <h3 style={{ whiteSpace: "pre" }}>{content}</h3>
      )}
    </div>
  );
};

export default Message;
