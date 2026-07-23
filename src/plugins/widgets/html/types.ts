import { API } from "../../types";

type Data = {
  input: string;
  allowJavaScript: boolean;
};

export type Props = API<Data>;

export const defaultData: Data = {
  input: "",
  allowJavaScript: false,
};
