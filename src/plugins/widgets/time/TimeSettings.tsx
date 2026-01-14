import React, { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Props, defaultData } from "./types";
import TimeZoneInput from "../../../views/shared/timeZone/TimeZoneInput";
import { pluginMessages } from "../../../locales/messages";

const TimeSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="TimeSettings">
      <label>
        <FormattedMessage {...pluginMessages.yourName} />
        <input
          type="text"
          value={data.name}
          placeholder={intl.formatMessage(pluginMessages.namePlaceholder)}
          onChange={(event) => setData({ ...data, name: event.target.value })}
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
        <input
          type="checkbox"
          checked={!data.hideTime}
          onChange={() => setData({ ...data, hideTime: !data.hideTime })}
        />{" "}
        <FormattedMessage
          id="plugins.time.displayTime"
          defaultMessage="Display time"
          description="Display time title"
        />
      </label>

      {!data.hideTime && (
        <>
          <label>
            <input
              type="radio"
              checked={data.mode === "analogue"}
              onChange={() => setData({ ...data, mode: "analogue" })}
            />{" "}
            <FormattedMessage
              id="plugins.time.analogue"
              defaultMessage="Analogue"
              description="Analogue title"
            />
          </label>

          {data.mode === "analogue" && (
            <label>
              <input
                type="checkbox"
                checked={data.colorCircles}
                onChange={() =>
                  setData({ ...data, colorCircles: !data.colorCircles })
                }
              />{" "}
              <FormattedMessage
                id="plugins.time.colorCircles"
                defaultMessage="Color circles"
                description="Color circles title"
              />
            </label>
          )}

          <label>
            <input
              type="radio"
              checked={data.mode === "digital" && data.hour12}
              onChange={() =>
                setData({ ...data, mode: "digital", hour12: true })
              }
            />{" "}
            <FormattedMessage
              id="plugins.time.12hrs"
              defaultMessage="12-hour digital"
              description="12-hour digital title"
            />
          </label>

          <label>
            <input
              type="radio"
              checked={data.mode === "digital" && !data.hour12}
              onChange={() =>
                setData({ ...data, mode: "digital", hour12: false })
              }
            />{" "}
            <FormattedMessage
              id="plugins.time.24hrs"
              defaultMessage="24-hour digital"
              description="24-hour digital title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showSeconds}
              onChange={() =>
                setData({ ...data, showSeconds: !data.showSeconds })
              }
            />{" "}
            <FormattedMessage
              id="plugins.time.displaySeconds"
              defaultMessage="Display seconds"
              description="Display seconds title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showMinutes}
              onChange={() =>
                setData({ ...data, showMinutes: !data.showMinutes })
              }
            />{" "}
            <FormattedMessage
              id="plugins.time.displayMinutes"
              defaultMessage="Display minutes"
              description="Display minutes title"
            />
          </label>

          {data.mode === "digital" && data.hour12 && (
            <label>
              <input
                type="checkbox"
                checked={data.showDayPeriod}
                onChange={() =>
                  setData({ ...data, showDayPeriod: !data.showDayPeriod })
                }
              />{" "}
              <FormattedMessage
                id="plugins.time.displayDayPeriod"
                defaultMessage="Display day period"
                description="Display day period title"
              />
            </label>
          )}
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={data.showDate}
          onChange={() => setData({ ...data, showDate: !data.showDate })}
        />{" "}
        <FormattedMessage
          id="plugins.time.displayDate"
          defaultMessage="Display date"
          description="Display date title"
        />
      </label>
    </div>
  );
};

export default TimeSettings;
