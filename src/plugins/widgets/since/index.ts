import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Since from "./Since";
import SinceSettings from "./SinceSettings";

const messages = defineMessages({
  name: {
    id: "plugins.since.name",
    defaultMessage: "Time Since",
    description: "Name of the Time Since widget",
  },
  description: {
    id: "plugins.since.description",
    defaultMessage: "Track time elapsed since a specific date.",
    description: "Description of the Time Since widget",
  },
});

const config: Config = {
  key: "widget/since",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Since,
  settingsComponent: SinceSettings,
};

export default config;
