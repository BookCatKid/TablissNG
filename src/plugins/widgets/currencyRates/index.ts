import { defineMessages } from "react-intl";

import { Config } from "../../types";
import CurrencyRates from "./CurrencyRates";
import CurrencyRatesSettings from "./CurrencyRatesSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.currencyRates.name",
    defaultMessage: "Currency Rates",
    description: "Name of the Currency Rates widget",
  },
  description: {
    id: "plugins.currencyRates.description",
    defaultMessage:
      "Track exchange rates for currencies, cryptocurrencies, and precious metals.",
    description: "Description of the Currency Rates widget",
  },
});

const config: Config = {
  key: "widget/currencyRates",
  name: messages.name,
  description: messages.description,
  dashboardComponent: CurrencyRates,
  settingsComponent: CurrencyRatesSettings,
  defaultData,
};

export default config;
