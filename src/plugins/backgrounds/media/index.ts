import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Media from "./Media";
import ImageSettings from "./MediaSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.media.name",
    defaultMessage: "Upload Images & Videos",
    description: "Name of the Media upload background",
  },
  description: {
    id: "backgrounds.media.description",
    defaultMessage: "See your own media.",
    description: "Description of the Media upload background",
  },
});

const config: Config = {
  key: "background/image", // not changing to /media for backwards compatibility.
  name: messages.name,
  description: messages.description,
  dashboardComponent: Media,
  settingsComponent: ImageSettings,
  supportsBackdrop: true,
};

export default config;
