import { defineMessages } from "react-intl";

export const monthMessages = defineMessages({
  jan: {
    id: "plugins.github.month.jan",
    defaultMessage: "Jan",
    description: "January short name for GitHub calendar",
  },
  feb: {
    id: "plugins.github.month.feb",
    defaultMessage: "Feb",
    description: "February short name for GitHub calendar",
  },
  mar: {
    id: "plugins.github.month.mar",
    defaultMessage: "Mar",
    description: "March short name for GitHub calendar",
  },
  apr: {
    id: "plugins.github.month.apr",
    defaultMessage: "Apr",
    description: "April short name for GitHub calendar",
  },
  may: {
    id: "plugins.github.month.may",
    defaultMessage: "May",
    description: "May short name for GitHub calendar",
  },
  jun: {
    id: "plugins.github.month.jun",
    defaultMessage: "Jun",
    description: "June short name for GitHub calendar",
  },
  jul: {
    id: "plugins.github.month.jul",
    defaultMessage: "Jul",
    description: "July short name for GitHub calendar",
  },
  aug: {
    id: "plugins.github.month.aug",
    defaultMessage: "Aug",
    description: "August short name for GitHub calendar",
  },
  sep: {
    id: "plugins.github.month.sep",
    defaultMessage: "Sep",
    description: "September short name for GitHub calendar",
  },
  oct: {
    id: "plugins.github.month.oct",
    defaultMessage: "Oct",
    description: "October short name for GitHub calendar",
  },
  nov: {
    id: "plugins.github.month.nov",
    defaultMessage: "Nov",
    description: "November short name for GitHub calendar",
  },
  dec: {
    id: "plugins.github.month.dec",
    defaultMessage: "Dec",
    description: "December short name for GitHub calendar",
  },
});

export const weekdayMessages = defineMessages({
  sun: {
    id: "plugins.github.weekday.sun",
    defaultMessage: "Sun",
    description: "Sunday short name for GitHub calendar",
  },
  mon: {
    id: "plugins.github.weekday.mon",
    defaultMessage: "Mon",
    description: "Monday short name for GitHub calendar",
  },
  tue: {
    id: "plugins.github.weekday.tue",
    defaultMessage: "Tue",
    description: "Tuesday short name for GitHub calendar",
  },
  wed: {
    id: "plugins.github.weekday.wed",
    defaultMessage: "Wed",
    description: "Wednesday short name for GitHub calendar",
  },
  thu: {
    id: "plugins.github.weekday.thu",
    defaultMessage: "Thu",
    description: "Thursday short name for GitHub calendar",
  },
  fri: {
    id: "plugins.github.weekday.fri",
    defaultMessage: "Fri",
    description: "Friday short name for GitHub calendar",
  },
  sat: {
    id: "plugins.github.weekday.sat",
    defaultMessage: "Sat",
    description: "Saturday short name for GitHub calendar",
  },
});

export const legendMessages = defineMessages({
  less: {
    id: "plugins.github.legend.less",
    defaultMessage: "Less",
    description: "Less text for GitHub calendar legend",
  },
  more: {
    id: "plugins.github.legend.more",
    defaultMessage: "More",
    description: "More text for GitHub calendar legend",
  },
});

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
