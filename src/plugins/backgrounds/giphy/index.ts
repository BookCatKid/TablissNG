import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Giphy from "./Giphy";
import GiphySettings from "./GiphySettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "backgrounds.giphy.name",
    defaultMessage: "GIPHY",
    description: "Name of the GIPHY background",
  },
  description: {
    id: "backgrounds.giphy.description",
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
  defaultData,
};

export default config;
