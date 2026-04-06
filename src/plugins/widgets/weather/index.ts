import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Weather from "./Weather";
import WeatherSettings from "./WeatherSettings";

const messages = defineMessages({
  name: {
    id: "plugins.weather.name",
    defaultMessage: "Weather",
    description: "Name of the Weather widget",
  },
  description: {
    id: "plugins.weather.description",
    defaultMessage: "Display current weather conditions for your location.",
    description: "Description of the Weather widget",
  },
});

const config: Config = {
  key: "widget/weather",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Weather,
  settingsComponent: WeatherSettings,
};

export default config;
