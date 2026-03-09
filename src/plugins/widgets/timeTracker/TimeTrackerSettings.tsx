import React, { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import TimeZoneInput from "../../../views/shared/timeZone/TimeZoneInput";
import { Props, defaultData } from "./types";
import { messages } from "./messages";
import { pluginMessages } from "../../../locales/messages";

const TimeTrackerSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  // Convert timestamp to local date string for input
  const toDateTimeString = (timestamp: number) => {
    const date = new Date(timestamp);
    // Format to local timezone YYYY-MM-DDThh:mm
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Update timestamp from date string, preserving the timezone
  const updateDateTime = (dateTimeString: string) => {
    // Parse the input value as a local date
    const [datePart, timePart] = dateTimeString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Create date in local timezone
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // Month is 0-indexed
    date.setDate(day);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    setData({ ...data, time: date.getTime() });
  };

  return (
    <div className="TimeTrackerSettings">
      <label>
        <FormattedMessage
          id="plugins.timeTracker.eventDateTime"
          defaultMessage="Event date and time"
        />
        <input
          type="datetime-local"
          value={toDateTimeString(data.time)}
          onChange={(event) => updateDateTime(event.target.value)}
        />
      </label>

      <label>
        <FormattedMessage {...pluginMessages.timeZone} />
        <TimeZoneInput
          timeZone={data.timeZone}
          onChange={(timeZone) => setData({ ...data, timeZone })}
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.timeTracker.titleOptional"
          defaultMessage="Title (optional)"
        />
        <input
          type="text"
          value={data.title || ""}
          onChange={(event) => setData({ ...data, title: event.target.value })}
          placeholder={intl.formatMessage(messages.eventNamePlaceholder)}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.showCompletedMessage}
          onChange={(event) =>
            setData({ ...data, showCompletedMessage: event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.timeTracker.showCompletionMessage"
          defaultMessage="Show completion message"
        />
      </label>

      {data.showCompletedMessage && (
        <label>
          <FormattedMessage
            id="plugins.timeTracker.completionMessage"
            defaultMessage="Completion message"
          />
          <input
            type="text"
            value={data.completedMessage || ""}
            onChange={(event) =>
              setData({ ...data, completedMessage: event.target.value })
            }
            placeholder={intl.formatMessage(messages.eventHasArrived)}
          />
        </label>
      )}

      <label>
        <FormattedMessage
          id="plugins.timeTracker.displayMode"
          defaultMessage="Display mode"
        />
        <select
          value={data.displayMode}
          onChange={(event) =>
            setData({
              ...data,
              displayMode: event.target.value as "compact" | "detailed",
            })
          }
        >
          <option value="compact">
            <FormattedMessage
              id="plugins.timeTracker.compact"
              defaultMessage="Compact"
            />
          </option>
          <option value="detailed">
            <FormattedMessage
              id="plugins.timeTracker.detailed"
              defaultMessage="Detailed"
            />
          </option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.italicizeTime}
          onChange={(event) =>
            setData({ ...data, italicizeTime: event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.timeTracker.italicizeTime"
          defaultMessage="Italicize time"
        />
      </label>
    </div>
  );
};

export default TimeTrackerSettings;
