import { API } from "../../types";
import { Conditions, DailyConditions } from "./conditions";

export type Coordinates = {
  latitude?: number;
  longitude?: number;
};

export type Data = Coordinates & {
  name?: string;
  showSummary: boolean;
  showDetails: boolean;
  showForecast: boolean;
  showCity: boolean;
  autoUpdate?: boolean;
  units: "auto" | "si" | "us"; // `auto` has been removed, but may still be present in settings
};

export type Cache =
  | {
      timestamp: number;
      conditions: Conditions[];
      dailyConditions: DailyConditions[];
    }
  | undefined;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  showSummary: true,
  showDetails: false,
  showForecast: false,
  showCity: true,
  units: "si",
};
