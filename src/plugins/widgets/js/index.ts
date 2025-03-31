import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Js from "./Js";
import JsSettings from "./JsSettings";

const messages = defineMessages({
  name: {
    id: "plugin.js.name",
    defaultMessage: "Custom JS",
    description: "Name of the Custom JS widget",
  },
  description: {
    id: "plugin.js.description",
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
