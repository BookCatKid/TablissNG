import { defineMessages } from "react-intl";

import { Config } from "../../types";
import IpInfo from "./IpInfo";
import IpInfoSettings from "./IpInfoSettings";

const messages = defineMessages({
  name: {
    id: "plugins.ipInfo.name",
    defaultMessage: "IP Info",
    description: "Name of the IP Info widget",
  },
  description: {
    id: "plugins.ipInfo.description",
    defaultMessage: "Display your IP address and location details.",
    description: "Description of the IP Info widget",
  },
});

const config: Config = {
  key: "widget/ipInfo",
  name: messages.name,
  description: messages.description,
  dashboardComponent: IpInfo,
  settingsComponent: IpInfoSettings,
};

export default config;
