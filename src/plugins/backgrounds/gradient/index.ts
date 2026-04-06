import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Gradient from "./Gradient";
import GradientSettings from "./GradientSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.gradient.name",
    defaultMessage: "Colour Gradient",
    description: "Name of the Colour Gradient background",
  },
  description: {
    id: "backgrounds.gradient.description",
    defaultMessage: "Add more splashes of colour.",
    description: "Description of the Colour Gradient background",
  },
});

const config: Config = {
  key: "background/gradient",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Gradient,
  settingsComponent: GradientSettings,
};

export default config;
