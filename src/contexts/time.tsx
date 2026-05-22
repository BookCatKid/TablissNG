import { toZonedTime } from "date-fns-tz";
import {
  createContext,
  type FC,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { db } from "../db/state";
import { useValue } from "../lib/db/react";

type Time = {
  absolute: Date;
  zoned: Date;
};

function getTime(timeZone: string | null = null): Time {
  const absolute = new Date();
  const zoned = timeZone ? toZonedTime(absolute, timeZone) : absolute;

  return { absolute, zoned };
}

// `defaultValue` here is irrelevant as it will be replaced in the provider
export const TimeContext = createContext(getTime());

const TimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const timeZone = useValue(db, "timeZone");
  const [time, setTime] = useState(getTime(timeZone));

  useEffect(() => {
    setTime(getTime(timeZone));
    const interval = setInterval(() => setTime(getTime(timeZone)), 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
};

export default TimeProvider;
