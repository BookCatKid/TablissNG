import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Links from "./Links";
import LinksSettings from "./LinksSettings";

const messages = defineMessages({
  name: {
    id: "plugin.links.name",
    defaultMessage: "Quick Links",
    description: "Name of the Quick Links widget",
  },
  description: {
    id: "plugin.links.description",
    defaultMessage: "Add custom links to your favorite sites.",
    description: "Description of the Quick Links widget",
  },
});

const config: Config = {
  key: "widget/links",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Links,
  settingsComponent: LinksSettings,
};

export default config;
