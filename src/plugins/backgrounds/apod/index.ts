import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Apod from "./Apod";
import ApodSettings from "./ApodSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.apod.name",
    defaultMessage: "Astronomy Picture of the Day",
    description: "Name of the APOD background",
  },
  description: {
    id: "backgrounds.apod.description",
    defaultMessage: "NASA's sky pictures",
    description: "Description of the APOD background",
  },
});

const config: Config = {
  key: "background/apod",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Apod,
  settingsComponent: ApodSettings,
  supportsBackdrop: true,
};

export default config;
