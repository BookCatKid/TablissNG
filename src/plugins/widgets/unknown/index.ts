import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Unknown from "./Unknown";
import UnknownSettings from "./UnknownSettings";

export const messages = defineMessages({
  name: {
    id: "plugins.unknown.name",
    defaultMessage: "Unknown Widget",
    description: "Name of the Unknown Widget",
  },
  description: {
    id: "plugins.unknown.description",
    defaultMessage: "Something went wrong.",
    description: "Description of the Unknown Widget",
  },
});

export const config: Config = {
  key: "widget/unknown",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Unknown,
  settingsComponent: UnknownSettings,
  supportsBackdrop: false,
};
