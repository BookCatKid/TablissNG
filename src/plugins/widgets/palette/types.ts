import { API } from "../../types";

export type Palette = {
  palette: number[][];
  timestamp: number;
  isLoading?: boolean;
};

export type Data = {
  colorFormat: "hex" | "rgb" | "hex_hidden" | "rgb_hidden";
  refreshInterval: number;
};

type Cache = Palette;

export type Props = API<Data, Cache>;

export type ColorProps = {
  displayColor: number[];
};

export const defaultData: Data = {
  colorFormat: "hex",
  refreshInterval: 3600,
};
