import { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { pluginMessages } from "../../../locales/messages";
import TimeZoneInput from "../../../views/shared/timeZone/TimeZoneInput";
import { defaultData, Props } from "./types";

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
          onChange={(event) =>
            setData({ ...data, hideTime: !event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.time.displayTime"
          defaultMessage="Display time"
          description="Display time title"
        />
      </label>

      {!data.hideTime && (
        <div style={{ marginLeft: "1em" }}>
          <label>
            <input
              type="radio"
              checked={data.mode === "analogue"}
              onChange={() => setData({ ...data, mode: "analogue" })}
            />
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
                onChange={(event) =>
                  setData({ ...data, colorCircles: event.target.checked })
                }
              />
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
            />
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
            />
            <FormattedMessage
              id="plugins.time.24hrs"
              defaultMessage="24-hour digital"
              description="24-hour digital title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showHours ?? true}
              onChange={(event) =>
                setData({ ...data, showHours: event.target.checked })
              }
            />
            <FormattedMessage
              id="plugins.time.displayHours"
              defaultMessage="Display hours"
              description="Display hours title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showMinutes ?? true}
              onChange={(event) =>
                setData({ ...data, showMinutes: event.target.checked })
              }
            />
            <FormattedMessage
              id="plugins.time.displayMinutes"
              defaultMessage="Display minutes"
              description="Display minutes title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showSeconds ?? false}
              onChange={(event) =>
                setData({ ...data, showSeconds: event.target.checked })
              }
            />
            <FormattedMessage
              id="plugins.time.displaySeconds"
              defaultMessage="Display seconds"
              description="Display seconds title"
            />
          </label>

          {data.mode === "digital" && data.hour12 && (
            <label>
              <input
                type="checkbox"
                checked={data.showDayPeriod}
                onChange={(event) =>
                  setData({ ...data, showDayPeriod: event.target.checked })
                }
              />
              <FormattedMessage
                id="plugins.time.displayDayPeriod"
                defaultMessage="Display day period"
                description="Display day period title"
              />
            </label>
          )}
        </div>
      )}

      <label>
        <input
          type="checkbox"
          checked={data.showDate}
          onChange={(event) =>
            setData({ ...data, showDate: event.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.time.displayDate"
          defaultMessage="Display date"
          description="Display date title"
        />
      </label>

      {data.showDate && (!data.hideTime || data.name) && (
        <div style={{ marginLeft: "1em" }}>
          <label>
            <input
              type="checkbox"
              checked={data.showSeparator}
              onChange={(event) =>
                setData({ ...data, showSeparator: event.target.checked })
              }
            />
            <FormattedMessage
              id="plugins.time.showSeparator"
              defaultMessage="Show Separator"
              description="Show separator toggle text"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default TimeSettings;
