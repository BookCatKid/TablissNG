import { defineMessages } from "react-intl";

const categoryMessages = defineMessages({
  any: {
    id: "plugins.joke.category.any",
    defaultMessage: "Any",
    description: "Joke category option",
  },
  misc: {
    id: "plugins.joke.category.misc",
    defaultMessage: "Misc",
    description: "Joke category option",
  },
  programming: {
    id: "plugins.joke.category.programming",
    defaultMessage: "Programming",
    description: "Joke category option",
  },
  pun: {
    id: "plugins.joke.category.pun",
    defaultMessage: "Pun",
    description: "Joke category option",
  },
  spooky: {
    id: "plugins.joke.category.spooky",
    defaultMessage: "Spooky",
    description: "Joke category option",
  },
  christmas: {
    id: "plugins.joke.category.christmas",
    defaultMessage: "Christmas",
    description: "Joke category option",
  },
});

export default [
  {
    key: "any",
    message: categoryMessages.any,
  },
  {
    key: "misc",
    message: categoryMessages.misc,
  },
  {
    key: "programming",
    message: categoryMessages.programming,
  },
  {
    key: "pun",
    message: categoryMessages.pun,
  },
  {
    key: "spooky",
    message: categoryMessages.spooky,
  },
  {
    key: "christmas",
    message: categoryMessages.christmas,
  },
] as const;
