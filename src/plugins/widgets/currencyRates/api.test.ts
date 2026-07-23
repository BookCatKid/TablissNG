import { planFetches, rateKey } from "./api";
import {
  CRYPTO_ASSETS,
  FIAT_CURRENCIES,
  getAsset,
  GRAMS_PER_TROY_OUNCE,
  isFiat,
  METAL_ASSETS,
  TARGET_ASSETS,
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

  it("gives every selectable asset a non-empty icon id", () => {
    const assets = [
      ...CRYPTO_ASSETS,
      ...METAL_ASSETS,
      ...FIAT_CURRENCIES,
      ...TARGET_ASSETS,
    ];
    for (const asset of assets) {
      expect(asset.icon).toEqual(expect.stringMatching(/^[\w-]+:[\w-]+$/));
    }
  });
});
