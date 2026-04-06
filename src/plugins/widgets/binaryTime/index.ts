import { defineMessages } from "react-intl";

import { Config } from "../../types";
import BinaryTime from "./BinaryTime";
import BinaryTimeSettings from "./BinaryTimeSettings";

const messages = defineMessages({
  name: {
    id: "plugins.binaryTime.name",
    defaultMessage: "Binary Clock",
    description: "Name of the Binary Clock widget",
  },
  description: {
    id: "plugins.binaryTime.description",
    defaultMessage: "Display time in binary format.",
    description: "Description of the Binary Clock widget",
  },
});

const config: Config = {
  key: "widget/binaryTime",
  name: messages.name,
  description: messages.description,
  dashboardComponent: BinaryTime,
  settingsComponent: BinaryTimeSettings,
};

export default config;
