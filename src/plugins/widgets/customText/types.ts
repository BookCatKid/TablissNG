import { API } from "../../types";

export type CustomTextData = {
  text: string;
  separator: string;
  strings: string[];
  atNewline: boolean;
  timeout: number;
  paused: boolean;
  richTextEnabled?: boolean;
};

export type Props = API<CustomTextData>;

export const defaultData: CustomTextData = {
  text: "",
  strings: [],
  separator: "",
  atNewline: true,
  timeout: 0,
  paused: false,
};
