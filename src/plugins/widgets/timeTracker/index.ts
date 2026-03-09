import { Config } from "../../types";
import { defineMessages } from "react-intl";
import TimeTracker from "./TimeTracker";
import TimeTrackerSettings from "./TimeTrackerSettings";

export const messages = defineMessages({
  name: {
    id: "plugins.timeTracker.name",
    defaultMessage: "Time Tracker",
    description: "Name of the Time Tracker widget",
  },
  description: {
    id: "plugins.timeTracker.description",
    defaultMessage: "Track time until or since important events.",
    description: "Description of the Time Tracker widget",
  },
});

const config: Config = {
  key: "widget/timeTracker",
  name: messages.name,
  description: messages.description,
  dashboardComponent: TimeTracker,
  settingsComponent: TimeTrackerSettings,
};

export default config;
