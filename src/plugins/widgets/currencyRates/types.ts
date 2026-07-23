import { API } from "../../types";

export type Pair = {
  id: string;
  /** Asset id: a CoinGecko coin id (crypto/metal) or a lowercase fiat code */
  from: string;
  /** Target asset id: a lowercase fiat code, or "btc"/"eth" */
  to: string;
  amount?: number;
};

export type Data = {
  pairs: Pair[];
  /** Minutes between refreshes */
  refreshInterval: number;
  decimals: number;
  showChange: boolean;
  showIcons: boolean;
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
    { id: "default-btc-usd", from: "bitcoin", to: "usd" },
    { id: "default-ton-usd", from: "the-open-network", to: "usd" },
    { id: "default-gold-usd", from: "pax-gold", to: "usd" },
  ],
  refreshInterval: 5,
  decimals: 2,
  showChange: true,
  showIcons: false,
};

export const defaultCache: Cache = {
  rates: {},
  timestamp: 0,
};
