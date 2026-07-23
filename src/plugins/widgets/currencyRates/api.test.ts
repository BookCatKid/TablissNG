import { getExpiry, planFetches, rateKey } from "./api";
import {
  CRYPTO_ASSETS,
  FIAT_CODES,
  getAsset,
  getCurrencyLabel,
  getTargetAssets,
  GRAMS_PER_TROY_OUNCE,
  isFiat,
  isSupportedPair,
  METAL_ASSETS,
} from "./assets";

describe("currencyRates/api", () => {
  it("builds a rate key from a from/to pair", () => {
    expect(rateKey("bitcoin", "usd")).toBe("bitcoin:usd");
  });

  it("groups crypto/metal pairs for a single CoinGecko request", () => {
    const plan = planFetches([
      { id: "1", from: "bitcoin", to: "usd" },
      { id: "2", from: "bitcoin", to: "rub" },
      { id: "3", from: "pax-gold", to: "usd" },
    ]);

    expect(plan.coingeckoIds.sort()).toEqual(["bitcoin", "pax-gold"]);
    expect(plan.coingeckoVsCurrencies.sort()).toEqual(["rub", "usd"]);
    expect(plan.fiatBases).toEqual([]);
  });

  it("groups fiat pairs by base currency, separate from crypto", () => {
    const plan = planFetches([
      { id: "1", from: "eur", to: "usd" },
      { id: "2", from: "eur", to: "rub" },
      { id: "3", from: "usd", to: "jpy" },
      { id: "4", from: "bitcoin", to: "usd" },
    ]);

    expect(plan.fiatBases.sort()).toEqual(["eur", "usd"]);
    expect(plan.coingeckoIds).toEqual(["bitcoin"]);
    expect(plan.coingeckoVsCurrencies).toEqual(["usd"]);
  });

  it("fetches immediately when there is no cache yet", () => {
    expect(getExpiry(undefined, 300)).toBe(0);
  });

  it("stays pinned at zero for 'every new tab', instead of drifting with the cache timestamp", () => {
    expect(getExpiry({ rates: {}, timestamp: Date.now() }, 0)).toBe(0);
    expect(getExpiry({ rates: {}, timestamp: Date.now() + 10_000 }, 0)).toBe(0);
  });

  it("computes a timestamp-based expiry for a non-zero interval", () => {
    const cache = { rates: {}, timestamp: 1000 };
    expect(getExpiry(cache, 300)).toBe(1000 + 300 * 1000);
  });
});

describe("currencyRates/assets", () => {
  it("identifies fiat currencies", () => {
    expect(isFiat("usd")).toBe(true);
    expect(isFiat("bitcoin")).toBe(false);
  });

  it("normalizes silver's per-gram price to a per-troy-ounce unit multiplier", () => {
    const silver = getAsset("kinesis-silver");
    expect(silver?.unitMultiplier).toBe(GRAMS_PER_TROY_OUNCE);

    const gold = getAsset("pax-gold");
    expect(gold?.unitMultiplier).toBeUndefined();
  });

  it("returns undefined for an unknown asset id", () => {
    expect(getAsset("not-a-real-asset")).toBeUndefined();
  });

  it("resolves any of the 166 supported fiat codes on demand", () => {
    expect(getAsset("afn", "en")?.category).toBe("fiat");
    expect(FIAT_CODES).toContain("afn");
  });

  it("gives every curated asset a non-empty icon id", () => {
    for (const asset of [...CRYPTO_ASSETS, ...METAL_ASSETS]) {
      expect(asset.icon).toEqual(expect.stringMatching(/^[\w-]+:[\w-]+$/));
    }
  });

  it("falls back to the bare code when Intl.DisplayNames has no name", () => {
    expect(getCurrencyLabel("usd", "en")).toContain("USD");
    expect(getCurrencyLabel("not-a-code", "en")).toBe("NOT-A-CODE");
  });

  it("gates the target list by the from-asset's category", () => {
    const fiatTargets = getTargetAssets("fiat", "en");
    expect(fiatTargets.map((asset) => asset.id)).toContain("afn");
    expect(fiatTargets.map((asset) => asset.id)).not.toContain("btc");

    const cryptoTargets = getTargetAssets("crypto", "en");
    expect(cryptoTargets.map((asset) => asset.id)).toContain("btc");
    expect(cryptoTargets.map((asset) => asset.id)).toContain("xau");
    expect(cryptoTargets.map((asset) => asset.id)).not.toContain("afn");
  });

  it("flags pairs the price providers can actually resolve", () => {
    expect(isSupportedPair("bitcoin", "usd", "en")).toBe(true);
    expect(isSupportedPair("eur", "afn", "en")).toBe(true);
    expect(isSupportedPair("bitcoin", "afn", "en")).toBe(false);
    expect(isSupportedPair("eur", "btc", "en")).toBe(false);
  });
});
