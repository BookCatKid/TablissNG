import React, { FC } from "react";
import { FormattedRelativeTime } from "react-intl";
import { useTime } from "../../../hooks";
import { selectUnit } from "../../../utils";
import { Props, defaultData } from "./types";

const Countdown: FC<Props> = ({ data = defaultData }) => {
  const currentTime = useTime();
  const { value, unit } = selectUnit(data.time, currentTime.getTime());

  return (
    <div className="Countdown">
      <h3>
        {currentTime.getTime() >= data.time ? (
          "It is time"
        ) : (
          <FormattedRelativeTime value={value} unit={unit} />
        )}
      </h3>
      {data.title && <h4>{data.title}</h4>}
    </div>
  );
};

export default Countdown;
