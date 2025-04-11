import { Config } from "../../types";
import { defineMessages } from "react-intl";
import GitHubCalendarWidget from "./GitHub";
import GitHubSettings from "./GitHubSettings";

const messages = defineMessages({
  name: {
    id: "plugin.github.name",
    defaultMessage: "GitHub Calendar",
    description: "Name of the GitHub Calendar widget",
  },
  description: {
    id: "plugin.github.description",
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
