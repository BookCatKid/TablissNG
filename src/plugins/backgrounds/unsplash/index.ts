import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Unsplash from "./Unsplash";
import UnsplashSettings from "./UnsplashSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.unsplash.name",
    defaultMessage: "Unsplash",
    description: "Name of the Unsplash background",
  },
  description: {
    id: "backgrounds.unsplash.description",
    defaultMessage: "Who has time to find their own images.",
    description: "Description of the Unsplash background",
  },
});

const config: Config = {
  key: "background/unsplash",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Unsplash,
  settingsComponent: UnsplashSettings,
  supportsBackdrop: true,
};

export default config;
