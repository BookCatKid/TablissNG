import { Config } from "../../types";
import { defineMessages } from "react-intl";
import IpInfo from "./IpInfo";
import IpInfoSettings from "./IpInfoSettings";

const messages = defineMessages({
  name: {
    id: "plugin.ipInfo.name",
    defaultMessage: "IP Info",
    description: "Name of the IP Info widget",
  },
  description: {
    id: "plugin.ipInfo.description",
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
