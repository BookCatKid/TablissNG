import { API } from "../../types";

type Data = {
  hour12: boolean;
  mode: "analogue" | "digital";
  showDate: boolean;
  hideTime: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  showDayPeriod?: boolean;
  timeZone: string | null;
  name?: string;
  colorCircles: boolean;
};

export type Props = API<Data>;

export const defaultData: Data = {
  mode: "digital",
  hour12: false,
  showDate: false,
  hideTime: false,
  showHours: true,
  showMinutes: true,
  showSeconds: false,
  showDayPeriod: true,
  timeZone: null,
  colorCircles: true,
};
