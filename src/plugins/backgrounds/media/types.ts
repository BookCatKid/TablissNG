import { RotatingCache } from "../../../hooks";
import { API } from "../../types";

export type Data = {
  paused?: boolean;
  timeout?: number;
  showControls: boolean;
  sortOrder?: "sequence" | "random";
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
  showControls: true,
  sortOrder: "random",
};
