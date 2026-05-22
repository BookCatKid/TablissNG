import { HOURS } from "../../../utils";
import { API } from "../../types";

export type Quote = {
  author?: string;
  quote: string;
  timestamp: number;
};

type Data = {
  category: string;
  timeout: number;
};

type Cache = Quote;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  category: "quotable",
  timeout: 1 * HOURS,
};
