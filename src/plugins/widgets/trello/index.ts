import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Trello from "./Trello";
import TrelloSettings from "./TrelloSettings";

const messages = defineMessages({
  name: {
    id: "plugins.trello.name",
    defaultMessage: "Trello",
    description: "Trello Integration",
  },
  description: {
    id: "plugins.trello.description",
    defaultMessage: "Conveniently view Trello Lists",
    description: "Conveniently view Trello Lists",
  },
});

const config: Config = {
  key: "widget/trello",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Trello,
  settingsComponent: TrelloSettings,
};

export default config;
