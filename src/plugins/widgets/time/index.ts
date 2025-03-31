import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Time from "./Time";
import TimeSettings from "./TimeSettings";

const messages = defineMessages({
  name: {
    id: "plugin.time.name",
    defaultMessage: "Time",
    description: "Name of the Time widget",
  },
  description: {
    id: "plugin.time.description",
    defaultMessage: "Display the current time in various formats.",
    description: "Description of the Time widget",
  },
});

const config: Config = {
  key: "widget/time",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Time,
  settingsComponent: TimeSettings,
};

export default config;
