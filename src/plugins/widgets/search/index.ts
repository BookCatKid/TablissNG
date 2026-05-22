import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Search from "./Search";
import SearchSettings from "./SearchSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.search.name",
    defaultMessage: "Search",
    description: "Name of the Search widget",
  },
  description: {
    id: "plugins.search.description",
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
  defaultData,
};

export default config;
