import { API } from "../../types";

type Data = {
  time: number;
  title?: string;
  showCompletedMessage: boolean;
  completedMessage?: string;
  displayMode: "compact" | "detailed";
  italicizeTime: boolean;
  timeZone: string | null;
};

export type Props = API<Data>;

export const defaultData: Data = {
  time: Date.now(),
  showCompletedMessage: true,
  displayMode: "compact",
  italicizeTime: false,
  timeZone: null,
};
