import { SECONDS } from "../../../utils";
import { API } from "../../types";
import { getAsset, isFiat } from "./assets";
import { Cache, CustomAsset, Pair, Rate } from "./types";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_SEARCH_URL = "https://api.coingecko.com/api/v3/search";
const FIAT_RATES_URL = "https://open.er-api.com/v6/latest";

export function rateKey(from: string, to: string): string {
  return `${from}:${to}`;
}

/** Groups pairs by data source so N pairs cost one CoinGecko call plus one call per distinct fiat base. */
export function planFetches(pairs: Pair[]) {
  const coingeckoIds = new Set<string>();
  const coingeckoVsCurrencies = new Set<string>();
  const fiatBases = new Set<string>();

  for (const pair of pairs) {
    if (isFiat(pair.from)) {
      fiatBases.add(pair.from);
    } else {
      coingeckoIds.add(pair.from);
      coingeckoVsCurrencies.add(pair.to);
    }
  }

  return {
    coingeckoIds: [...coingeckoIds],
    coingeckoVsCurrencies: [...coingeckoVsCurrencies],
    fiatBases: [...fiatBases],
  };
}

type CoingeckoResponse = Record<string, Record<string, number>>;

async function fetchCoingeckoRates(
  ids: string[],
  vsCurrencies: string[],
): Promise<CoingeckoResponse> {
  const url =
    `${COINGECKO_URL}?ids=${encodeURIComponent(ids.join(","))}` +
    `&vs_currencies=${encodeURIComponent(vsCurrencies.join(","))}` +
    `&include_24hr_change=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status}`);
  }
  return res.json();
}

async function fetchFiatRates(base: string): Promise<Record<string, number>> {
  const res = await fetch(`${FIAT_RATES_URL}/${base.toUpperCase()}`);
  if (!res.ok) {
    throw new Error(`Exchange rate request failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.result !== "success") {
    throw new Error("Exchange rate request failed");
  }
  return data.rates;
}

type CoingeckoSearchResponse = {
  coins: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
  }[];
};

export async function searchCoins(query: string): Promise<CustomAsset[]> {
  if (query.trim().length === 0) {
    return [];
  }

  const res = await fetch(
    `${COINGECKO_SEARCH_URL}?query=${encodeURIComponent(query)}`,
  );
  if (!res.ok) {
    throw new Error(`CoinGecko search failed: ${res.status}`);
  }

  const data: CoingeckoSearchResponse = await res.json();
  return data.coins.map((coin) => ({
    id: coin.id,
    label: `${coin.name} (${coin.symbol.toUpperCase()})`,
    symbol: coin.symbol.toUpperCase(),
    icon: coin.thumb,
  }));
}

export function getExpiry(
  cache: Cache | undefined,
  refreshInterval: number,
): number {
  if (!cache || refreshInterval === 0) {
    return 0;
  }
  return cache.timestamp + refreshInterval * SECONDS;
}

export async function getRates(
  pairs: Pair[],
  loader: API["loader"],
): Promise<Record<string, Rate>> {
  loader.push();

  try {
    const { coingeckoIds, coingeckoVsCurrencies, fiatBases } =
      planFetches(pairs);

    const [coingeckoData, fiatEntries] = await Promise.all([
      coingeckoIds.length > 0
        ? fetchCoingeckoRates(coingeckoIds, coingeckoVsCurrencies)
        : Promise.resolve<CoingeckoResponse>({}),
      Promise.all(
        fiatBases.map(
          async (base) => [base, await fetchFiatRates(base)] as const,
        ),
      ),
    ]);

    const fiatRatesByBase = new Map(fiatEntries);
    const rates: Record<string, Rate> = {};

    for (const pair of pairs) {
      const key = rateKey(pair.from, pair.to);

      if (isFiat(pair.from)) {
        const value = fiatRatesByBase.get(pair.from)?.[pair.to.toUpperCase()];
        if (value !== undefined) {
          rates[key] = { value };
        }
        continue;
      }

      const entry = coingeckoData[pair.from];
      const value = entry?.[pair.to];
      if (value === undefined) {
        continue;
      }

      const multiplier = getAsset(pair.from)?.unitMultiplier ?? 1;
      const change = entry[`${pair.to}_24h_change`];

      rates[key] = {
        value: value * multiplier,
        change24h: typeof change === "number" ? change : undefined,
      };
    }

    return rates;
  } finally {
    loader.pop();
  }
}
