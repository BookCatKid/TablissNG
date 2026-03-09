import { format } from "date-fns";
import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { parseLocalDate } from "../../../utils";
import { pluginMessages } from "../../../locales/messages";
import { messages as timeTrackerMessages } from "../timeTracker/index";
import { defaultData, Props } from "./types";

function formatDate(time: number): string {
  return format(time, "yyyy-MM-dd");
}

function formatTime(time: number): string {
  return format(time, "HH:mm:ss");
}

function buildDateObject(time: number, timeStr: string): Date {
  return new Date(`${formatDate(time)} ${timeStr || "00:00:00"}`);
}

const CountdownSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="CountdownSettings">
    <FormattedMessage
      {...pluginMessages.deprecationWarning}
      values={{
        widget: <FormattedMessage {...timeTrackerMessages.name} />,
      }}
    />

    <label>
      What
      <input
        type="text"
        value={data.title || ""}
        onChange={(event) => setData({ ...data, title: event.target.value })}
      />
    </label>

    <label>
      When
      <label>
        Date
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
        Time
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

export default CountdownSettings;
