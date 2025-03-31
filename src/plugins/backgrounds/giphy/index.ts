import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Giphy from "./Giphy";
import GiphySettings from "./GiphySettings";

const messages = defineMessages({
  name: {
    id: "background.giphy.name",
    defaultMessage: "GIPHY",
    description: "Name of the GIPHY background",
  },
  description: {
    id: "background.giphy.description",
    defaultMessage: "Hurt your eyes in every new tab.",
    description: "Description of the GIPHY background",
  },
});

const config: Config = {
  key: "background/giphy",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Giphy,
  settingsComponent: GiphySettings,
  supportsBackdrop: true,
};

export default config;
