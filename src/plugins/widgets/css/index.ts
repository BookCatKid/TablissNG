import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Css from "./Css";
import CssSettings from "./CssSettings";

const messages = defineMessages({
  name: {
    id: "plugins.css.name",
    defaultMessage: "Custom CSS",
    description: "Name of the Custom CSS widget",
  },
  description: {
    id: "plugins.css.description",
    defaultMessage: "Make your new tab more style-ish (advanced users).",
    description: "Description of the Custom CSS widget",
  },
});

const config: Config = {
  key: "widget/css",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Css,
  settingsComponent: CssSettings,
};

export default config;
