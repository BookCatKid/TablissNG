import { API } from "../../types";

type Data = {
  username?: string;
  showColorLegend: boolean;
  showMonthLabels: boolean;
  showTotalCount: boolean;
  showTooltips: boolean;
  clickAction: "none" | "potd" | "profile";
};

export type Props = API<Data>;

export const defaultData: Data = {
  username: "",
  showColorLegend: false,
  showMonthLabels: false,
  showTotalCount: false,
  showTooltips: true,
  clickAction: "potd",
};
