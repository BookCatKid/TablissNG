import "./Time.sass";

import { toZonedTime } from "date-fns-tz";
import { FC, useRef } from "react";
import { FormattedDate } from "react-intl";

import { useTime } from "../../../hooks";
import Analogue from "./Analogue";
import Digital from "./Digital";
import { defaultData, Props } from "./types";

const Time: FC<Props> = ({ data = defaultData }) => {
  const {
    hour12,
    mode,
    name,
    colorCircles,
    showDate,
    hideTime,
    showHours = true,
    showMinutes,
    showSeconds,
    timeZone,
    showDayPeriod = true,
    showSeparator,
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
              showHours={showHours}
              showMinutes={showMinutes}
              showSeconds={showSeconds}
              color={color}
              colorCircles={colorCircles}
            />
          ) : (
            <Digital
              time={time}
              hour12={hour12}
              showHours={showHours}
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
          {(!hideTime || name) && showSeparator && (
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
