import React, { FC } from "react";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
import { Props, defaultData } from "./types";

const messages = defineMessages({
  messagePlaceholder: {
    id: "plugins.message.messagePlaceholder",
    defaultMessage: "Write something fun",
    description: "Placeholder text for message input",
  },
});

const MessageSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="MessageSettings">
      <label>
        <FormattedMessage
          id="plugins.message.message"
          defaultMessage="Message"
          description="Message title"
        />
        <textarea
          rows={3}
          style={{ resize: "vertical" }}
          placeholder={intl.formatMessage(messages.messagePlaceholder)}
          value={data.messages[0]}
          onChange={(event) => setData({ messages: [event.target.value] })}
        />
      </label>
    </div>
  );
};

export default MessageSettings;
