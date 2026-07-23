export type AssetCategory = "crypto" | "metal" | "fiat";

export type Asset = {
  /** CoinGecko coin id for crypto/metal assets, or a lowercase ISO 4217 code for fiat */
  id: string;
  category: AssetCategory;
  label: string;
  symbol: string;
  /** Multiplies the raw API price to normalize the display unit (e.g. grams -> troy oz) */
  unitMultiplier?: number;
  /** Iconify icon identifier, shown next to the symbol when "Show currency icons" is on */
  icon: string;
};

export const GRAMS_PER_TROY_OUNCE = 31.1034768;

// Generic fallback for fiat currencies without a dedicated symbol icon (e.g. PLN).
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
    // No dedicated token icon exists for Kinesis Silver, use a generic silver coin icon.
    icon: "memory:coin-silver",
  },
];

export const FIAT_CURRENCIES: Asset[] = [
  {
    id: "usd",
    category: "fiat",
    label: "US Dollar (USD)",
    symbol: "USD",
    icon: "mdi:currency-usd",
  },
  {
    id: "eur",
    category: "fiat",
    label: "Euro (EUR)",
    symbol: "EUR",
    icon: "mdi:currency-eur",
  },
  {
    id: "rub",
    category: "fiat",
    label: "Russian Ruble (RUB)",
    symbol: "RUB",
    icon: "mdi:currency-rub",
  },
  {
    id: "gbp",
    category: "fiat",
    label: "British Pound (GBP)",
    symbol: "GBP",
    icon: "mdi:currency-gbp",
  },
  {
    id: "jpy",
    category: "fiat",
    label: "Japanese Yen (JPY)",
    symbol: "JPY",
    icon: "mdi:currency-jpy",
  },
  {
    id: "cny",
    category: "fiat",
    label: "Chinese Yuan (CNY)",
    symbol: "CNY",
    icon: "mdi:currency-cny",
  },
  {
    id: "uah",
    category: "fiat",
    label: "Ukrainian Hryvnia (UAH)",
    symbol: "UAH",
    icon: "mdi:currency-uah",
  },
  {
    id: "kzt",
    category: "fiat",
    label: "Kazakhstani Tenge (KZT)",
    symbol: "KZT",
    icon: "mdi:currency-kzt",
  },
  {
    id: "try",
    category: "fiat",
    label: "Turkish Lira (TRY)",
    symbol: "TRY",
    icon: "mdi:currency-try",
  },
  {
    id: "inr",
    category: "fiat",
    label: "Indian Rupee (INR)",
    symbol: "INR",
    icon: "mdi:currency-inr",
  },
  // AUD/CAD use the same $ glyph as USD; MDI has no separate icon for them.
  {
    id: "aud",
    category: "fiat",
    label: "Australian Dollar (AUD)",
    symbol: "AUD",
    icon: "mdi:currency-usd",
  },
  {
    id: "cad",
    category: "fiat",
    label: "Canadian Dollar (CAD)",
    symbol: "CAD",
    icon: "mdi:currency-usd",
  },
  {
    id: "chf",
    category: "fiat",
    label: "Swiss Franc (CHF)",
    symbol: "CHF",
    icon: "mdi:currency-chf",
  },
  {
    id: "pln",
    category: "fiat",
    label: "Polish Zloty (PLN)",
    symbol: "PLN",
    icon: FALLBACK_FIAT_ICON,
  },
  {
    id: "brl",
    category: "fiat",
    label: "Brazilian Real (BRL)",
    symbol: "BRL",
    icon: "mdi:currency-brl",
  },
];

// Extra crypto targets that CoinGecko supports as a `vs_currency`, for crypto-to-crypto pairs.
export const CRYPTO_TARGETS: Asset[] = [
  {
    id: "btc",
    category: "crypto",
    label: "Bitcoin (BTC)",
    symbol: "BTC",
    icon: "token-branded:btc",
  },
  {
    id: "eth",
    category: "crypto",
    label: "Ethereum (ETH)",
    symbol: "ETH",
    icon: "token-branded:eth",
  },
];

// Options for the "to" dropdown: any fiat currency, plus the crypto targets above.
export const TARGET_ASSETS: Asset[] = [...FIAT_CURRENCIES, ...CRYPTO_TARGETS];

const ALL_ASSETS: Asset[] = [
  ...CRYPTO_ASSETS,
  ...METAL_ASSETS,
  ...FIAT_CURRENCIES,
  ...CRYPTO_TARGETS,
];

export function getAsset(id: string): Asset | undefined {
  return ALL_ASSETS.find((asset) => asset.id === id);
}

export function isFiat(id: string): boolean {
  return FIAT_CURRENCIES.some((asset) => asset.id === id);
}
