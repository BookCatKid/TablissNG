import React, { FC } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { useIntl } from "react-intl";
import { useFormatMessages } from "../../../hooks/useFormatMessages";
import { useTheme } from "../../../hooks/useTheme";
import {
  monthMessages,
  weekdayMessages,
  legendMessages,
  messages,
} from "./messages";
import { Props, defaultData } from "./types";

const GitHubCalendarWidget: FC<Props> = ({ data = defaultData }) => {
  const intl = useIntl();
  const months = useFormatMessages(monthMessages);
  const weekdays = useFormatMessages(weekdayMessages);
  const legend = useFormatMessages(legendMessages);
  const { isDark } = useTheme();

  if (!data.username) return null;

  // Localization for the calendar
  const labels = {
    months: [
      months.jan,
      months.feb,
      months.mar,
      months.apr,
      months.may,
      months.jun,
      months.jul,
      months.aug,
      months.sep,
      months.oct,
      months.nov,
      months.dec,
    ],
    weekdays: [
      weekdays.sun,
      weekdays.mon,
      weekdays.tue,
      weekdays.wed,
      weekdays.thu,
      weekdays.fri,
      weekdays.sat,
    ],
    totalCount: intl
      .formatMessage(messages.totalCount)
      .replace("[count]", "{{count}}")
      .replace("[year]", "{{year}}"),
    legend: {
      less: legend.less,
      more: legend.more,
    },
  };

  return (
    <a
      className="GitHub"
      href={
        data.clickAction !== "none"
          ? `https://github.com/${data.clickAction === "profile" ? data.username : ""}`
          : undefined
      }
      target="_blank"
      rel="noopener noreferrer"
      style={{
        cursor: data.clickAction === "none" ? "default" : "pointer",
        textDecoration: "none",
      }}
    >
      <GitHubCalendar
        showColorLegend={data.showColorLegend}
        showMonthLabels={data.showMonthLabels}
        showTotalCount={data.showTotalCount}
        username={data.username}
        labels={labels}
        colorScheme={isDark ? "dark" : "light"}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
        }}
      />
    </a>
  );
};

export default GitHubCalendarWidget;
