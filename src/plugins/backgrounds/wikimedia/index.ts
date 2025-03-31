import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Wikimedia from "./Wikimedia";
import WikimediaSettings from "./WikimediaSettings";

const messages = defineMessages({
  name: {
    id: "background.wikimedia.name",
    defaultMessage: "Wikimedia Image of the Day",
    description: "Name of the Wikimedia background",
  },
  description: {
    id: "background.wikimedia.description",
    defaultMessage: "Get the image of the day from Wikimedia Commons.",
    description: "Description of the Wikimedia background",
  },
});

const config: Config = {
  key: "background/wikimedia",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Wikimedia,
  settingsComponent: WikimediaSettings,
  supportsBackdrop: true,
};

export default config;
