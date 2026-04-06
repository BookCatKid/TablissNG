import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Joke from "./Joke";
import JokeSettings from "./JokeSettings";

const messages = defineMessages({
  name: {
    id: "plugins.joke.name",
    defaultMessage: "Jokes",
    description: "Name of the Jokes widget",
  },
  description: {
    id: "plugins.joke.description",
    defaultMessage: "Get a laugh with random jokes.",
    description: "Description of the Jokes widget",
  },
});

const config: Config = {
  key: "widget/joke",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Joke,
  settingsComponent: JokeSettings,
};

export default config;
