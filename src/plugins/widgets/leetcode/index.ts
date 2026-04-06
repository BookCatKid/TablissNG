import { defineMessages } from "react-intl";

import { Config } from "../../types";
import LeetcodeCalendarWidget from "./Leetcode";
import LeetcodeSettings from "./LeetcodeSettings";

const messages = defineMessages({
  name: {
    id: "plugins.leetcode.name",
    defaultMessage: "Leetcode Calendar",
    description: "Name of the Leetcode Calendar widget",
  },
  description: {
    id: "plugins.leetcode.description",
    defaultMessage: "Get motivated by green squares.",
    description: "Description of the Leetcode Calendar widget",
  },
});

const config: Config = {
  key: "widget/leetcode",
  name: messages.name,
  description: messages.description,
  dashboardComponent: LeetcodeCalendarWidget,
  settingsComponent: LeetcodeSettings,
};

export default config;
