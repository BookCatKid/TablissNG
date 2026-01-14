import React, { FC, useRef } from "react";
import { FormattedDate } from "react-intl";
import { useTime } from "../../../hooks";
import Analogue from "./Analogue";
import Digital from "./Digital";
import { Props, defaultData } from "./types";
import "./Time.sass";
import { toZonedTime } from "date-fns-tz";

const Time: FC<Props> = ({ data = defaultData }) => {
  const {
    hour12,
    mode,
    name,
    colorCircles,
    showDate,
    hideTime,
    showMinutes,
    showSeconds,
    timeZone,
    showDayPeriod = true,
  } = data;
  let time = useTime(timeZone ? "absolute" : "zoned");

  const h3Ref = useRef<HTMLHeadingElement | null>(null);
  const color =
    (h3Ref.current && window.getComputedStyle(h3Ref.current).color) || "white";

  if (timeZone) {
    time = toZonedTime(time, timeZone);
  }

  return (
    <div className="Time">
      {!hideTime && (
        <>
          {mode === "analogue" ? (
            <Analogue
              time={time}
              showMinutes={showMinutes}
              showSeconds={showSeconds}
              color={color}
              colorCircles={colorCircles}
            />
          ) : (
            <Digital
              time={time}
              hour12={hour12}
              showMinutes={showMinutes}
              showSeconds={showSeconds}
              showDayPeriod={showDayPeriod}
            />
          )}
        </>
      )}

      {name && <h2>{name}</h2>}

      {showDate && (
        <>
          {(!hideTime || name) && (
            <hr
              style={{
                borderColor: color,
              }}
            />
          )}
          <h3 ref={h3Ref}>
            <FormattedDate
              value={time}
              day="numeric"
              month="long"
              weekday="long"
            />
          </h3>
        </>
      )}
    </div>
  );
};

export default Time;
