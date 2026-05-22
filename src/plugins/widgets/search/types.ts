import { API } from "../../types";

export type SearchStyle =
  | "default"
  | "transparent-rounded"
  | "minimal-outlined";

type Data = {
  searchEngine: string;
  searchEngineCustom?: string;
  suggestionsEngine?: string;
  suggestionsQuantity: number;
  placeholderText?: string;
  keyBind?: string;
  style?: SearchStyle;
  overrideWidth?: boolean;
  customWidth?: number;
};

export type Props = API<Data>;

export const defaultData: Data = {
  searchEngine: "default",
  suggestionsQuantity: 4,
  keyBind: "G",
  style: "default",
};

export const SEARCH_ENGINE_CUSTOM = "CUSTOM";
