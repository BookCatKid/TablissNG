import { API } from "../../types";

type Data = {
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  name?: string;
  onColor: string;
  offColor: string;
  timeZone: string | null;
};

export type Props = API<Data>;

export const defaultData: Data = {
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  onColor: "#48d8b8",
  offColor: "#525252",
  timeZone: null,
};
