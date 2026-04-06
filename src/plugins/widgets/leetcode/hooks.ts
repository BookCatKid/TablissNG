import { useEffect, useState } from "react";
import { Activity } from "react-activity-calendar";
import { useIntl } from "react-intl";

import { useFormatMessages } from "../../../hooks";
import {
  calendarLegendMessages,
  monthMessages,
  weekdayMessages,
} from "../../../locales/messages";
import { fetchCalendar } from "./api";
import { messages, tooltipMessages } from "./messages";

export const useCalendar = (username: string | undefined) => {
  const [calendar, setCalendar] = useState<Activity[] | null>(null);

  const getCalendar = async (username: string) => {
    const cal = await fetchCalendar(username);
    setCalendar(cal);
  };

  useEffect(() => {
    if (username) {
      getCalendar(username);
    } else {
      setCalendar(null);
    }
  }, [username]);

  return { calendar };
};

export const useMessages = () => {
  const intl = useIntl();
  const months = useFormatMessages(monthMessages);
  const weekdays = useFormatMessages(weekdayMessages);
  const legend = useFormatMessages(calendarLegendMessages);

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

  const tooltip = (activity: Activity) => {
    if (activity.count === 0) {
      return intl.formatMessage(tooltipMessages.noActivity, {
        date: activity.date,
      });
    }

    return intl.formatMessage(tooltipMessages.activity, {
      count: activity.count,
      date: activity.date,
    });
  };

  return { labels, tooltip };
};
