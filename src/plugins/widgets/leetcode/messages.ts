import { defineMessages } from "react-intl";

export const messages = defineMessages({
  totalCount: {
    id: "plugins.leetcode.totalCount",
    defaultMessage: "[count] submissions in [year]",
    description: "Total count text for leetcode calendar",
  },
});

export const tooltipMessages = defineMessages({
  activity: {
    id: "plugins.leetcode.tooltip.activity",
    defaultMessage: "{count, number} submissions on {date}",
    description: "Tooltip text showing submission count on a specific date",
  },
  noActivity: {
    id: "plugins.leetcode.tooltip.noActivity",
    defaultMessage: "No submissions on {date}",
    description: "Tooltip text for days with no submissions",
  },
});
