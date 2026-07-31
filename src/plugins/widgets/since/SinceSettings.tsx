import { format } from "date-fns";
import { FC } from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { pluginMessages } from "../../../locales/messages";
import { parseLocalDate } from "../../../utils";
import { messages as timeTrackerMessages } from "../timeTracker/index";
import { defaultData, Props } from "./types";

const sinceMessages = defineMessages({
  what: {
    id: "plugins.since.what",
    defaultMessage: "What",
    description: "Label for the what field in Since settings",
  },
  when: {
    id: "plugins.since.when",
    defaultMessage: "When",
    description: "Label for the when field in Since settings",
  },
  date: {
    id: "plugins.since.date",
    defaultMessage: "Date",
    description: "Label for the date field in Since settings",
  },
  time: {
    id: "plugins.since.time",
    defaultMessage: "Time",
    description: "Label for the time field in Since settings",
  },
});

function formatDate(time: number): string {
  return format(time, "yyyy-MM-dd");
}

function formatTime(time: number): string {
  return format(time, "HH:mm:ss");
}

function buildDateObject(time: number, timeStr: string): Date {
  return new Date(`${formatDate(time)} ${timeStr || "00:00:00"}`);
}

const SinceSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="SinceSettings">
    <FormattedMessage
      {...pluginMessages.deprecationWarning}
      values={{
        widget: <FormattedMessage {...timeTrackerMessages.name} />,
      }}
    />

    <label>
      <FormattedMessage {...sinceMessages.what} />
      <input
        type="text"
        value={data.title || ""}
        onChange={(event) => setData({ ...data, title: event.target.value })}
      />
    </label>

    <label>
      <FormattedMessage {...sinceMessages.when} />
      <label>
        <FormattedMessage {...sinceMessages.date} />
        <input
          type="date"
          value={formatDate(data.time)}
          onChange={(event) => {
            if (event.target.value) {
              const date = parseLocalDate(event.target.value);
              // Preserve the existing time
              const existingDate = new Date(data.time);
              date.setHours(existingDate.getHours());
              date.setMinutes(existingDate.getMinutes());
              date.setSeconds(existingDate.getSeconds());
              setData({ ...data, time: date.getTime() });
            } else {
              setData({ ...data, time: new Date().getTime() });
            }
          }}
        />
      </label>
      <label>
        <FormattedMessage {...sinceMessages.time} />
        <input
          type="time"
          value={formatTime(data.time)}
          onChange={(event) => {
            setData({
              ...data,
              time: buildDateObject(data.time, event.target.value).getTime(),
            });
          }}
        />
      </label>
    </label>
  </div>
);

export default SinceSettings;
