import { defineMessages } from "react-intl";

export const sectionMessages = defineMessages({
  open: {
    id: "section.open",
    defaultMessage: "Open",
    description: "Text for opening the section",
  },
  close: {
    id: "section.close",
    defaultMessage: "Close",
    description: "Text for closing the section",
  },
  displaySettings: {
    id: "section.displaySettings",
    defaultMessage: "Display Settings",
    description: "Display settings section title",
  },
  fontSettings: {
    id: "section.fontSettings",
    defaultMessage: "Font Settings",
    description: "Font settings section title",
  },
});

export const pluginMessages = defineMessages({
  poweredBy: {
    id: "plugins.poweredBy",
    defaultMessage: "Powered by",
    description: "Attribution text for external services",
  },
  apply: {
    id: "plugins.apply",
    defaultMessage: "Apply",
    description: "Apply button title",
  },
  yourName: {
    id: "plugins.yourName",
    defaultMessage: "Your name",
    description: "Your name title",
  },
  namePlaceholder: {
    id: "plugins.namePlaceholder",
    defaultMessage: "Optional name",
    description: "Placeholder text for name input",
  },
});

export const timingMessages = defineMessages({
  everyNewTab: {
    id: "plugins.everyNewTab",
    defaultMessage: "Every new tab",
    description: "Every new tab title",
  },
  every5min: {
    id: "plugins.every5min",
    defaultMessage: "Every 5 minutes",
    description: "Every 5 minutes title",
  },
  every15min: {
    id: "plugins.every15min",
    defaultMessage: "Every 15 minutes",
    description: "Every 15 minutes title",
  },
  everyHour: {
    id: "plugins.everyHour",
    defaultMessage: "Every hour",
    description: "Every hour title",
  },
  everyDay: {
    id: "plugins.everyDay",
    defaultMessage: "Every day",
    description: "Every day title",
  },
  everyWeek: {
    id: "plugins.everyWeek",
    defaultMessage: "Every week",
    description: "Every week title",
  },
  // everyCustom
});
