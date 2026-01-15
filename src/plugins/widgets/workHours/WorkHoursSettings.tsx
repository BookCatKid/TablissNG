import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { useFormatMessages } from "../../../hooks/useFormatMessages";
import { days } from "./messages";
import { Props, defaultData } from "./types";

const WorkHoursSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const dayNames = useFormatMessages(days);
  const daysArray = [
    { index: 0, name: dayNames.sunday },
    { index: 1, name: dayNames.monday },
    { index: 2, name: dayNames.tuesday },
    { index: 3, name: dayNames.wednesday },
    { index: 4, name: dayNames.thursday },
    { index: 5, name: dayNames.friday },
    { index: 6, name: dayNames.saturday },
  ];
  return (
    <div className="WorkHoursSettings">
      <label>
        <FormattedMessage
          id="plugins.workHours.startTime"
          defaultMessage="Start time"
          description="Start time title"
        />
        <input
          type="time"
          value={data.startTime}
          onChange={(event) =>
            setData({ ...data, startTime: event.target.value })
          }
        />
      </label>
      <label>
        <FormattedMessage
          id="plugins.workHours.endTime"
          defaultMessage="End time"
          description="End time title"
        />
        <input
          type="time"
          value={data.endTime}
          onChange={(event) =>
            setData({ ...data, endTime: event.target.value })
          }
        />
      </label>
      <label>
        <FormattedMessage
          id="plugins.workHours.flipPercentage"
          defaultMessage="Flip percentage?"
          description="Option to flip the percentage calculation"
        />
        <input
          style={{ marginLeft: "10px" }}
          type="checkbox"
          checked={data.flipPercentage}
          onChange={(event) =>
            setData({ ...data, flipPercentage: event.target.checked })
          }
        />
      </label>

      {daysArray.map((day) => (
        <div key={day.index}>
          <label>
            <input
              type="checkbox"
              checked={data.days.includes(day.index)}
              onChange={(event) =>
                setData({
                  ...data,
                  days: event.target.checked
                    ? [...data.days, day.index]
                    : data.days.filter((d) => d !== day.index),
                })
              }
            />
            {day.name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default WorkHoursSettings;
