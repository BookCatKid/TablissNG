import { defineMessages } from "react-intl";

import { Config } from "../../types";
import Quote from "./Quote";
import QuoteSettings from "./QuoteSettings";

const messages = defineMessages({
  name: {
    id: "plugins.quote.name",
    defaultMessage: "Quotes",
    description: "Name of the Quote widget",
  },
  description: {
    id: "plugins.quote.description",
    defaultMessage: "Be inspired (or not, there's categories).",
    description: "Description of the Quote widget",
  },
});

const config: Config = {
  key: "widget/quote",
  name: messages.name,
  description: messages.description,
  dashboardComponent: Quote,
  settingsComponent: QuoteSettings,
};

export default config;
