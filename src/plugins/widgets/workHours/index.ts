import { defineMessages } from "react-intl";

import { Config } from "../../types";
import WorkHours from "./WorkHours";
import WorkHoursSettings from "./WorkHoursSettings";

const messages = defineMessages({
  name: {
    id: "plugins.workHours.name",
    defaultMessage: "Work Hours",
    description: "Name of the Work Hours widget",
  },
  description: {
    id: "plugins.workHours.description",
    defaultMessage: "Track your working hours and time remaining.",
    description: "Description of the Work Hours widget",
  },
});

const config: Config = {
  key: "widget/workHours",
  name: messages.name,
  description: messages.description,
  dashboardComponent: WorkHours,
  settingsComponent: WorkHoursSettings,
};

export default config;
