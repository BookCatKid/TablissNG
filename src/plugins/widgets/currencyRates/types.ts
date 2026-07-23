import { API } from "../../types";

export type CustomAsset = {
  id: string;
  label: string;
  symbol: string;
  icon: string;
};

export type Pair = {
  id: string;
  /** A CoinGecko coin id (crypto/metal), a lowercase fiat code, or a live-searched custom coin's id */
  from: string;
  /** A lowercase fiat code, or a CoinGecko `vs_currency` code such as "btc"/"xau" */
  to: string;
  amount?: number;
  showChange?: boolean;
  showIcons?: boolean;
  /** Denormalized snapshot for a `from` asset picked via live search, not in the curated catalog */
  customAsset?: CustomAsset;
};

export type Data = {
  pairs: Pair[];
  /** Seconds between refreshes; 0 means "every new tab" */
  refreshInterval: number;
  decimals: number;
};

export type Rate = {
  value: number;
  change24h?: number;
};

export type Cache = {
  rates: Record<string, Rate>;
  timestamp: number;
};

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  pairs: [
    { id: "default-btc-usd", from: "bitcoin", to: "usd", showChange: true },
    {
      id: "default-ton-usd",
      from: "the-open-network",
      to: "usd",
      showChange: true,
    },
    { id: "default-gold-usd", from: "pax-gold", to: "usd", showChange: true },
  ],
  refreshInterval: 300,
  decimals: 2,
};

export const defaultCache: Cache = {
  rates: {},
  timestamp: 0,
};
