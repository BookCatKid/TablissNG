import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Html from "./Html";
import HtmlSettings from "./HtmlSettings";

const messages = defineMessages({
  name: {
    id: "plugin.html.name",
    defaultMessage: "Custom HTML",
    description: "Name of the Custom HTML widget",
  },
  description: {
    id: "plugin.html.description",
    defaultMessage: "Add static HTML (advanced users).",
    description: "Description of the Custom HTML widget",
  },
});

const config: Config = {
  key: "widget/html",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Html,
  settingsComponent: HtmlSettings,
};

export default config;
