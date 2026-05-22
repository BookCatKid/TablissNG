import { defineMessages } from "react-intl";

import { Config } from "../../types";
import BitcoinWidget from "./Bitcoin";
import BitcoinSettings from "./BitcoinSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.bitcoin.name",
    defaultMessage: "Bitcoin Mempool",
    description: "Name of the Bitcoin Mempool widget",
  },
  description: {
    id: "plugins.bitcoin.description",
    defaultMessage: "Get the current block height.",
    description: "Description of the Bitcoin Mempool widget",
  },
});

const config: Config = {
  key: "widget/bitcoin",
  name: messages.name,
  description: messages.description,
  dashboardComponent: BitcoinWidget,
  settingsComponent: BitcoinSettings,
  defaultData,
};

export default config;
