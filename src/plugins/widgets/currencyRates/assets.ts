import type { Pair } from "./types";

export type AssetCategory = "crypto" | "metal" | "fiat";

export type Asset = {
  id: string;
  category: AssetCategory;
  label: string;
  symbol: string;
  unitMultiplier?: number;
  icon: string;
};

export const GRAMS_PER_TROY_OUNCE = 31.1034768;

const FALLBACK_FIAT_ICON = "mdi:cash";

export const CRYPTO_ASSETS: Asset[] = [
  {
    id: "bitcoin",
    category: "crypto",
    label: "Bitcoin (BTC)",
    symbol: "BTC",
    icon: "token-branded:btc",
  },
  {
    id: "ethereum",
    category: "crypto",
    label: "Ethereum (ETH)",
    symbol: "ETH",
    icon: "token-branded:eth",
  },
  {
    id: "the-open-network",
    category: "crypto",
    label: "Toncoin (TON)",
    symbol: "TON",
    icon: "token-branded:ton",
  },
  {
    id: "solana",
    category: "crypto",
    label: "Solana (SOL)",
    symbol: "SOL",
    icon: "token-branded:sol",
  },
  {
    id: "ripple",
    category: "crypto",
    label: "XRP",
    symbol: "XRP",
    icon: "token-branded:xrp",
  },
  {
    id: "dogecoin",
    category: "crypto",
    label: "Dogecoin (DOGE)",
    symbol: "DOGE",
    icon: "token-branded:doge",
  },
  {
    id: "binancecoin",
    category: "crypto",
    label: "BNB",
    symbol: "BNB",
    icon: "token-branded:bnb",
  },
  {
    id: "cardano",
    category: "crypto",
    label: "Cardano (ADA)",
    symbol: "ADA",
    icon: "token-branded:ada",
  },
  {
    id: "litecoin",
    category: "crypto",
    label: "Litecoin (LTC)",
    symbol: "LTC",
    icon: "token-branded:ltc",
  },
  {
    id: "tether",
    category: "crypto",
    label: "Tether (USDT)",
    symbol: "USDT",
    icon: "token-branded:usdt",
  },
  {
    id: "usd-coin",
    category: "crypto",
    label: "USD Coin (USDC)",
    symbol: "USDC",
    icon: "token-branded:usdc",
  },
];

// Tokenized, 1:1 physical-metal-backed assets, priced through the same CoinGecko endpoint as crypto.
export const METAL_ASSETS: Asset[] = [
  {
    id: "pax-gold",
    category: "metal",
    label: "Gold (troy oz)",
    symbol: "XAU",
    icon: "token-branded:paxg",
  },
  {
    id: "kinesis-silver",
    category: "metal",
    label: "Silver (troy oz)",
    symbol: "XAG",
    unitMultiplier: GRAMS_PER_TROY_OUNCE,
    icon: "memory:coin-silver",
  },
];

const CURATED_ASSETS: Asset[] = [...CRYPTO_ASSETS, ...METAL_ASSETS];

// Every code open.er-api.com's /v6/latest endpoint returns rates for (confirmed live).
export const FIAT_CODES = [
  "aed",
  "afn",
  "all",
  "amd",
  "ang",
  "aoa",
  "ars",
  "aud",
  "awg",
  "azn",
  "bam",
  "bbd",
  "bdt",
  "bgn",
  "bhd",
  "bif",
  "bmd",
  "bnd",
  "bob",
  "brl",
  "bsd",
  "btn",
  "bwp",
  "byn",
  "bzd",
  "cad",
  "cdf",
  "chf",
  "clf",
  "clp",
  "cnh",
  "cny",
  "cop",
  "crc",
  "cup",
  "cve",
  "czk",
  "djf",
  "dkk",
  "dop",
  "dzd",
  "egp",
  "ern",
  "etb",
  "eur",
  "fjd",
  "fkp",
  "fok",
  "gbp",
  "gel",
  "ggp",
  "ghs",
  "gip",
  "gmd",
  "gnf",
  "gtq",
  "gyd",
  "hkd",
  "hnl",
  "hrk",
  "htg",
  "huf",
  "idr",
  "ils",
  "imp",
  "inr",
  "iqd",
  "irr",
  "isk",
  "jep",
  "jmd",
  "jod",
  "jpy",
  "kes",
  "kgs",
  "khr",
  "kid",
  "kmf",
  "krw",
  "kwd",
  "kyd",
  "kzt",
  "lak",
  "lbp",
  "lkr",
  "lrd",
  "lsl",
  "lyd",
  "mad",
  "mdl",
  "mga",
  "mkd",
  "mmk",
  "mnt",
  "mop",
  "mru",
  "mur",
  "mvr",
  "mwk",
  "mxn",
  "myr",
  "mzn",
  "nad",
  "ngn",
  "nio",
  "nok",
  "npr",
  "nzd",
  "omr",
  "pab",
  "pen",
  "pgk",
  "php",
  "pkr",
  "pln",
  "pyg",
  "qar",
  "ron",
  "rsd",
  "rub",
  "rwf",
  "sar",
  "sbd",
  "scr",
  "sdg",
  "sek",
  "sgd",
  "shp",
  "sle",
  "sll",
  "sos",
  "srd",
  "ssp",
  "stn",
  "syp",
  "szl",
  "thb",
  "tjs",
  "tmt",
  "tnd",
  "top",
  "try",
  "ttd",
  "tvd",
  "twd",
  "tzs",
  "uah",
  "ugx",
  "usd",
  "uyu",
  "uzs",
  "ves",
  "vnd",
  "vuv",
  "wst",
  "xaf",
  "xcd",
  "xcg",
  "xdr",
  "xof",
  "xpf",
  "yer",
  "zar",
  "zmw",
  "zwg",
  "zwl",
];

// Shown first in the fiat picker before the rest of FIAT_CODES, alphabetically-unsorted.
export const COMMON_FIAT_CODES = [
  "usd",
  "eur",
  "rub",
  "gbp",
  "jpy",
  "cny",
  "uah",
  "kzt",
  "try",
  "inr",
  "aud",
  "cad",
  "chf",
  "pln",
  "brl",
];

// The few fiat codes with a dedicated Material Design Icons symbol (verified live).
const FIAT_ICON_OVERRIDES: Record<string, string> = {
  usd: "mdi:currency-usd",
  aud: "mdi:currency-usd",
  cad: "mdi:currency-usd",
  eur: "mdi:currency-eur",
  rub: "mdi:currency-rub",
  gbp: "mdi:currency-gbp",
  jpy: "mdi:currency-jpy",
  cny: "mdi:currency-cny",
  uah: "mdi:currency-uah",
  kzt: "mdi:currency-kzt",
  try: "mdi:currency-try",
  inr: "mdi:currency-inr",
  chf: "mdi:currency-chf",
  brl: "mdi:currency-brl",
  krw: "mdi:currency-krw",
};

export function getCurrencyLabel(code: string, locale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "currency" });
    const name = displayNames.of(code.toUpperCase());
    return name && name.toUpperCase() !== code.toUpperCase()
      ? `${name} (${code.toUpperCase()})`
      : code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function buildFiatAsset(code: string, locale: string): Asset {
  const id = code.toLowerCase();
  return {
    id,
    category: "fiat",
    label: getCurrencyLabel(id, locale),
    symbol: id.toUpperCase(),
    icon: FIAT_ICON_OVERRIDES[id] ?? FALLBACK_FIAT_ICON,
  };
}

// CoinGecko's /api/v3/simple/supported_vs_currencies whitelist (confirmed live), split by kind.
const COINGECKO_CRYPTO_TARGET_CODES = [
  "btc",
  "eth",
  "ltc",
  "bch",
  "bnb",
  "eos",
  "xrp",
  "xlm",
  "link",
  "dot",
  "yfi",
  "sol",
];
const COINGECKO_FIAT_TARGET_CODES = [
  "usd",
  "aed",
  "ars",
  "aud",
  "bdt",
  "bhd",
  "bmd",
  "brl",
  "cad",
  "chf",
  "clp",
  "cny",
  "czk",
  "dkk",
  "eur",
  "gbp",
  "gel",
  "hkd",
  "huf",
  "idr",
  "ils",
  "inr",
  "jpy",
  "krw",
  "kwd",
  "lkr",
  "mmk",
  "mxn",
  "myr",
  "ngn",
  "nok",
  "nzd",
  "php",
  "pkr",
  "pln",
  "rub",
  "sar",
  "sek",
  "sgd",
  "thb",
  "try",
  "twd",
  "uah",
  "vef",
  "vnd",
  "zar",
  "xdr",
];

const CRYPTO_TARGET_META: Record<
  string,
  { label: string; symbol: string; icon: string }
> = {
  btc: { label: "Bitcoin (BTC)", symbol: "BTC", icon: "token-branded:btc" },
  eth: { label: "Ethereum (ETH)", symbol: "ETH", icon: "token-branded:eth" },
  ltc: { label: "Litecoin (LTC)", symbol: "LTC", icon: "token-branded:ltc" },
  bch: {
    label: "Bitcoin Cash (BCH)",
    symbol: "BCH",
    icon: "token-branded:bch",
  },
  bnb: { label: "BNB", symbol: "BNB", icon: "token-branded:bnb" },
  eos: { label: "EOS", symbol: "EOS", icon: "token-branded:eos" },
  xrp: { label: "XRP", symbol: "XRP", icon: "token-branded:xrp" },
  xlm: { label: "Stellar (XLM)", symbol: "XLM", icon: "token-branded:xlm" },
  link: {
    label: "Chainlink (LINK)",
    symbol: "LINK",
    icon: "token-branded:link",
  },
  dot: { label: "Polkadot (DOT)", symbol: "DOT", icon: "token-branded:dot" },
  yfi: {
    label: "yearn.finance (YFI)",
    symbol: "YFI",
    icon: "token-branded:yfi",
  },
  sol: { label: "Solana (SOL)", symbol: "SOL", icon: "token-branded:sol" },
};

/** Valid `to` options depend on which API serves the pair's `from` asset. */
export function getTargetAssets(
  fromCategory: AssetCategory,
  locale: string,
): Asset[] {
  if (fromCategory === "fiat") {
    return FIAT_CODES.map((code) => buildFiatAsset(code, locale));
  }

  const cryptoTargets = COINGECKO_CRYPTO_TARGET_CODES.map((code) => ({
    id: code,
    category: "crypto" as const,
    ...CRYPTO_TARGET_META[code],
  }));

  const metalTargets = METAL_ASSETS.map((metal) => ({
    ...metal,
    id: metal.symbol.toLowerCase(),
  }));

  const fiatTargets = COINGECKO_FIAT_TARGET_CODES.map((code) =>
    buildFiatAsset(code, locale),
  );

  return [...cryptoTargets, ...metalTargets, ...fiatTargets];
}

export function getAsset(id: string, locale = "en"): Asset | undefined {
  const curated = CURATED_ASSETS.find((asset) => asset.id === id);
  if (curated) return curated;

  if ((id === "xau" || id === "xag") && !FIAT_CODES.includes(id)) {
    const metal = METAL_ASSETS.find(
      (asset) => asset.symbol.toLowerCase() === id,
    );
    if (metal) return { ...metal, id };
  }

  if (CRYPTO_TARGET_META[id]) {
    return { id, category: "crypto", ...CRYPTO_TARGET_META[id] };
  }

  if (FIAT_CODES.includes(id)) {
    return buildFiatAsset(id, locale);
  }

  return undefined;
}

export function isSupportedPair(
  from: string,
  to: string,
  locale: string,
): boolean {
  const category = getAsset(from, locale)?.category ?? "crypto";
  return getTargetAssets(category, locale).some((asset) => asset.id === to);
}

/** Resolves a pair's from/to asset, falling back to a live-search snapshot for non-curated coins. */
export function resolveAsset(
  pair: Pair,
  side: "from" | "to",
  locale: string,
): Asset | undefined {
  const id = side === "from" ? pair.from : pair.to;
  const asset = getAsset(id, locale);
  if (asset) return asset;

  if (side === "from" && pair.customAsset) {
    return { ...pair.customAsset, category: "crypto" };
  }

  return undefined;
}

export function isIconUrl(icon: string): boolean {
  return icon.startsWith("http://") || icon.startsWith("https://");
}

export function isFiat(id: string): boolean {
  return FIAT_CODES.includes(id);
}
