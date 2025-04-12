import { Config } from "../../types";
import { defineMessages } from "react-intl";
import CustomText from "./CustomText";
import CustomTextSettings from "./CustomTextSettings";

const messages = defineMessages({
  name: {
    id: "plugins.customText.name",
    defaultMessage: "Custom Text",
    description: "Name of the Custom Text widget",
  },
  description: {
    id: "plugins.customText.description",
    defaultMessage: "Custom text from set",
    description: "Description of the Custom Text widget",
  },
});

const config: Config = {
  key: "widget/customText",
  name: messages.name,
  description: messages.description,
  dashboardComponent: CustomText,
  settingsComponent: CustomTextSettings,
};

export default config;
