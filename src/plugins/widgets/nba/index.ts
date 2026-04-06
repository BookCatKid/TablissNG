import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Nba from "./Nba";
import NbaSettings from "./NbaSettings";

const messages = defineMessages({
  name: {
    id: "plugins.nba.name",
    defaultMessage: "NBA Scores",
    description: "Name of the NBA Scores widget",
  },
  description: {
    id: "plugins.nba.description",
    defaultMessage: "Keep up to date with today's NBA games.",
    description: "Description of the NBA Scores widget",
  },
});

const config: Config = {
  key: "widget/nba",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Nba,
  settingsComponent: NbaSettings,
};

export default config;
