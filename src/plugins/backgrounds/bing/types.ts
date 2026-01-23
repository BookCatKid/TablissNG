import { API } from "../../types";

export type BingDate = "today" | "custom";

export interface Data {
  date: BingDate;
  customDate?: string;
  locale: string; // e.g. US/en
  showTitle: boolean;
}

export interface Image {
  url: string;
  title?: string | null;
  copyright?: string | null;
  date: Date;
}

type Cache = Image | undefined;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  date: "today",
  locale: "US/en",
  showTitle: true,
};
