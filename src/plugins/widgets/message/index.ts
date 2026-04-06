import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Message from "./Message";
import MessageSettings from "./MessageSettings";

const messages = defineMessages({
  name: {
    id: "plugins.message.name",
    defaultMessage: "Message",
    description: "Name of the Message widget",
  },
  description: {
    id: "plugins.message.description",
    defaultMessage: "Add your own text.",
    description: "Description of the Message widget",
  },
});

const config: Config = {
  key: "widget/message",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Message,
  settingsComponent: MessageSettings,
};

export default config;
