import React, { FC } from "react";
import "./Analogue.sass";

type Props = {
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  time: Date;
  color: string;
  colorCircles: boolean;
};

const Analogue: FC<Props> = ({
  time,
  showHours,
  showMinutes,
  showSeconds,
  colorCircles,
  color,
}) => {
  const hoursAngle = time.getHours() * 30 + time.getMinutes() * 0.5;
  const minutesAngle = time.getHours() * 360 + time.getMinutes() * 6;
  const secondsAngle =
    time.getHours() * 360 + time.getMinutes() * 360 + time.getSeconds() * 6;

  return (
    <div className="Time Analogue">
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="bezel theme-stroke"
          style={{ stroke: colorCircles ? color : "white" }}
        />

        {showHours && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="30"
            className="hours theme-stroke"
            style={{ transform: `rotate(${hoursAngle}deg)`, stroke: color }}
          />
        )}

        {showMinutes && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            className="minutes theme-stroke"
            style={{ transform: `rotate(${minutesAngle}deg)`, stroke: color }}
          />
        )}

        {showSeconds && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            className="seconds theme-stroke"
            style={{ transform: `rotate(${secondsAngle}deg)`, stroke: color }}
          />
        )}

        <circle
          cx="50"
          cy="50"
          r="3"
          className="cap theme-fill"
          style={{ fill: colorCircles ? color : "white" }}
        />
      </svg>
    </div>
  );
};

export default Analogue;
