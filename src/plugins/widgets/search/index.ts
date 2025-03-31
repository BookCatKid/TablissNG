import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Search from "./Search";
import SearchSettings from "./SearchSettings";

const messages = defineMessages({
  name: {
    id: "plugin.search.name",
    defaultMessage: "Search",
    description: "Name of the Search widget",
  },
  description: {
    id: "plugin.search.description",
    defaultMessage: "Search the web using your favorite engine.",
    description: "Description of the Search widget",
  },
});

const config: Config = {
  key: "widget/search",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Search,
  settingsComponent: SearchSettings,
};

export default config;
