import { Config } from "../../types";
import { defineMessages } from "react-intl";
import Palette from "./Palette";
import PaletteSettings from "./PaletteSettings";

const messages = defineMessages({
  name: {
    id: "plugins.palette.name",
    defaultMessage: "Random Color Palettes",
    description: "Name of the Palette widget",
  },
  description: {
    id: "plugins.palette.description",
    defaultMessage: "Be inspired with beautiful random color palettes.",
    description: "Description of the Palette widget",
  },
});

const config: Config = {
  key: "widget/palette",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Palette,
  settingsComponent: PaletteSettings,
};

export default config;
