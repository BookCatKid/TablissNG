import React, { FC, useState, useEffect } from "react";
import { FormattedRelativeTime, FormattedMessage } from "react-intl";
import { useTime } from "../../../hooks";
import { selectUnit } from "../../../utils";
import { Props, defaultData } from "./types";
import { messages } from "./messages";
import { toZonedTime } from "date-fns-tz";
import "./TimeTracker.sass";

const TimeTracker: FC<Props> = ({ data = defaultData }) => {
  let time = useTime(data.timeZone ? "absolute" : "zoned");

  if (data.timeZone) {
    time = toZonedTime(time, data.timeZone);
  }

  const now = time.getTime();
  const targetTime = data.time;
  const isPast = now >= targetTime;

  const timeDiff = targetTime - now;
  const { value, unit } = selectUnit(targetTime, now);

  const [timeComponents, setTimeComponents] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateDetailedTime = () => {
      let diff = Math.abs(timeDiff) / 1000;

      const days = Math.floor(diff / 86400);
      diff -= days * 86400;

      const hours = Math.floor(diff / 3600);
      diff -= hours * 3600;

      const minutes = Math.floor(diff / 60);
      diff -= minutes * 60;

      const seconds = Math.floor(diff);

      setTimeComponents({ days, hours, minutes, seconds });
    };

    updateDetailedTime();

    const timer = setInterval(updateDetailedTime, 1000);
    return () => clearInterval(timer);
  }, [timeDiff]);

  const renderDetailedTime = () => {
    const { days, hours, minutes, seconds } = timeComponents;

    return (
      <div className="time-components">
        {days > 0 && (
          <span className="time-component">
            <span className="value">{days}</span>
            <span className={`unit ${data.italicizeTime ? "italic-time" : ""}`}>
              <FormattedMessage
                {...(days === 1 ? messages.day : messages.days)}
              />
            </span>
          </span>
        )}
        <span className="time-component">
          <span className="value">{hours}</span>
          <span className={`unit ${data.italicizeTime ? "italic-time" : ""}`}>
            <FormattedMessage
              {...(hours === 1 ? messages.hour : messages.hours)}
            />
          </span>
        </span>
        <span className="time-component">
          <span className="value">{minutes}</span>
          <span className={`unit ${data.italicizeTime ? "italic-time" : ""}`}>
            <FormattedMessage
              {...(minutes === 1 ? messages.minute : messages.minutes)}
            />
          </span>
        </span>
        <span className="time-component">
          <span className="value">{seconds}</span>
          <span className={`unit ${data.italicizeTime ? "italic-time" : ""}`}>
            <FormattedMessage
              {...(seconds === 1 ? messages.second : messages.seconds)}
            />
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="TimeTracker">
      {isPast && data.showCompletedMessage ? (
        <div className="completed">
          {data.completedMessage || (
            <FormattedMessage {...messages.eventHasArrived} />
          )}
        </div>
      ) : data.displayMode === "compact" ? (
        <h3>
          {data.title && <span className="title">{data.title}</span>}
          &nbsp;
          {isPast ? (
            <span>
              <FormattedMessage
                id="plugins.timeTracker.was"
                defaultMessage="was"
              />{" "}
              <span className={data.italicizeTime ? "italic-time" : ""}>
                <FormattedRelativeTime value={value} unit={unit} />
              </span>
            </span>
          ) : (
            <span>
              <FormattedMessage
                id="plugins.timeTracker.isIn"
                defaultMessage="is"
              />{" "}
              <span className={data.italicizeTime ? "italic-time" : ""}>
                <FormattedRelativeTime value={value} unit={unit} />
              </span>
            </span>
          )}
        </h3>
      ) : (
        <div className="detailed">
          {data.title && <h3 className="title">{data.title}</h3>}
          <div className="time-info">{renderDetailedTime()}</div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
