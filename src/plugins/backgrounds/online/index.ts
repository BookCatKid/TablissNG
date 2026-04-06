import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Online from "./Online";
import OnlineSettings from "./OnlineSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.online.name",
    defaultMessage: "Online Image",
    description: "Name of the Online Image background",
  },
  description: {
    id: "backgrounds.online.description",
    defaultMessage: "Show online image",
    description: "Description of the Online Image background",
  },
});

const config: Config = {
  key: "background/online",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Online,
  settingsComponent: OnlineSettings,
  supportsBackdrop: true,
};

export default config;
