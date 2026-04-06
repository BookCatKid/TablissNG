/**
 * Literature Clock Widget for Tabliss
 * Forked by Ngoc L.B. <contact@ngoclb.com>
 * ===
 * Clock using time quotes from the literature, based on work and idea by Jaap Meijers (E-reader clock).
 * @url http://jenevoldsen.com/literature-clock/
 * @url https://github.com/JohannesNE/literature-clock
 */
import { defineMessages } from "react-intl";

import { Config } from "../../types";
import LiteratureClock from "./LiteratureClock";
import LiteratureClockSettings from "./LiteratureClockSettings";

const messages = defineMessages({
  name: {
    id: "plugins.literatureClock.name",
    defaultMessage: "Literature Clock",
    description: "Name of the Literature Clock widget",
  },
  description: {
    id: "plugins.literatureClock.description",
    defaultMessage: "Check the time, with sophistication.",
    description: "Description of the Literature Clock widget",
  },
});

const config: Config = {
  key: "widget/literature-clock",
  name: messages.name,
  description: messages.description,
  dashboardComponent: LiteratureClock,
  settingsComponent: LiteratureClockSettings,
};

export default config;
