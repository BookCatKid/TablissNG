import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Bing from "./Bing";
import BingSettings from "./BingSettings";

const messages = defineMessages({
  name: {
    id: "backgrounds.bing.name",
    defaultMessage: "Bing Daily Wallpaper",
    description: "Name of the Bing background",
  },
  description: {
    id: "backgrounds.bing.description",
    defaultMessage: "Microsoft Bing daily wallpapers (various locales)",
    description: "Description of the Bing background",
  },
});

const config: Config = {
  key: "background/bing",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Bing,
  settingsComponent: BingSettings,
  supportsBackdrop: true,
};

export default config;
