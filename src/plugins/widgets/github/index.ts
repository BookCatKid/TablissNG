import { defineMessages } from "react-intl";

import { Config } from "../../types";
import GitHubCalendarWidget from "./GitHub";
import GitHubSettings from "./GitHubSettings";

const messages = defineMessages({
  name: {
    id: "plugins.github.name",
    defaultMessage: "GitHub Calendar",
    description: "Name of the GitHub Calendar widget",
  },
  description: {
    id: "plugins.github.description",
    defaultMessage: "Get motivated by green squares.",
    description: "Description of the GitHub Calendar widget",
  },
});

const config: Config = {
  key: "widget/github",
  name: messages.name,
  description: messages.description,
  dashboardComponent: GitHubCalendarWidget,
  settingsComponent: GitHubSettings,
};

export default config;
