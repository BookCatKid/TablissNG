import { RotatingCache } from "../../../hooks";
import { API } from "../../types";

export type Data = {
  jsonPath: string;
  paused: boolean;
  responseType: "image" | "json";
  showControls: boolean;
  timeout: number;
  url: string;
};

export type Image = {
  url: string;
};

export type Cache = RotatingCache<Image>;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  jsonPath: "",
  paused: false,
  responseType: "image",
  showControls: true,
  timeout: 900,
  url: "",
};
