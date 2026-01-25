import { RotatingCache } from "../../../hooks";
import { API } from "../../types";

export type Data = {
  paused?: boolean;
  timeout?: number;
};

export type Cache = RotatingCache<File>;

export type Props = API<Data, Cache>;

export const defaultCache: Cache = {
  items: [],
  cursor: 0,
  rotated: 0,
  deps: [],
};

export const defaultData: Data = {
  paused: false,
  timeout: 900,
};
