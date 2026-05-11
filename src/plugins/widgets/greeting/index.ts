import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Greeting from "./Greeting";
import GreetingSettings from "./GreetingSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.greeting.name",
    defaultMessage: "Greeting",
    description: "Name of the Greeting widget",
  },
  description: {
    id: "plugins.greeting.description",
    defaultMessage: "Be personally greeted all day.",
    description: "Description of the Greeting widget",
  },
});

const config: Config = {
  key: "widget/greeting",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Greeting,
  settingsComponent: GreetingSettings,
  defaultData,
};

export default config;
