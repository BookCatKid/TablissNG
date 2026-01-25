import { RotatingCache } from "../../../hooks";
import { API } from "../../types";

export type Gif = {
  url: string;
  link: string;
  title?: string;
  username?: string;
  userLink?: string;
};

export type Data = {
  by: "trending" | "random" | "search";
  nsfw: boolean;
  tag: string;
  paused?: boolean;
  timeout: number;
};

export type Cache = RotatingCache<Gif>;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  by: "trending",
  nsfw: false,
  tag: "pattern",
  paused: false,
  timeout: 900,
};
