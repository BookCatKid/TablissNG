import { defineMessages } from "react-intl";

export const messages = defineMessages({
  totalCount: {
    id: "plugins.github.totalCount",
    defaultMessage: "[count] contributions in [year]",
    description: "Total count text for GitHub calendar",
  },
});

export const tooltipMessages = defineMessages({
  activity: {
    id: "plugins.github.tooltip.activity",
    defaultMessage: "{count, number} contributions on {date}",
    description: "Tooltip text showing contribution count on a specific date",
  },
  noActivity: {
    id: "plugins.github.tooltip.noActivity",
    defaultMessage: "No contributions on {date}",
    description: "Tooltip text for days with no contributions",
  },
});
