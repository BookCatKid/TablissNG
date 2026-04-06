import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Js from "./Js";
import JsSettings from "./JsSettings";

const messages = defineMessages({
  name: {
    id: "plugins.js.name",
    defaultMessage: "Custom JS",
    description: "Name of the Custom JS widget",
  },
  description: {
    id: "plugins.js.description",
    defaultMessage: "Program in your program.",
    description: "Description of the Custom JS widget",
  },
});

const config: Config = {
  key: "widget/js",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Js,
  settingsComponent: JsSettings,
};

export default config;
