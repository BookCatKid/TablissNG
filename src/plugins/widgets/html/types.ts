import { API } from "../../types";

type Data = {
  input: string;
  /** When true, `<script>` tags and JS in the snippet are executed (isolated iframe). */
  allowJavaScript: boolean;
};

export type Props = API<Data>;

export const defaultData: Data = {
  input: "",
  allowJavaScript: false,
};
