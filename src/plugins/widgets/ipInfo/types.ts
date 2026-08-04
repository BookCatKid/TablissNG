import { API } from "../../types";

type Data = {
  displayCity: boolean;
  displayCountry: boolean;
  hideIP: boolean;
  maskIP: boolean;
  clickToRefresh: boolean;
  autoRefresh: boolean;
};

export type IpData = {
  ip: string;
  city: string;
  country: string;
};

type Cache = IpData;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  displayCity: true,
  displayCountry: true,
  hideIP: false,
  maskIP: false,
  clickToRefresh: true,
  autoRefresh: false,
};
