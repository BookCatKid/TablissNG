import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ICONIFY_API = "https://api.iconify.design";
const outputPath = path.resolve("src/icons/bundled.json");

const requestedIcons = {
  mdi: [
    "cash",
    "currency-brl",
    "currency-chf",
    "currency-cny",
    "currency-eur",
    "currency-gbp",
    "currency-inr",
    "currency-jpy",
    "currency-krw",
    "currency-kzt",
    "currency-rub",
    "currency-try",
    "currency-uah",
    "currency-usd",
  ],
  memory: ["coin-silver"],
  "token-branded": [
    "ada",
    "bch",
    "bnb",
    "btc",
    "doge",
    "dot",
    "eos",
    "eth",
    "link",
    "ltc",
    "paxg",
    "sol",
    "ton",
    "usdc",
    "usdt",
    "xlm",
    "xrp",
    "yfi",
  ],
};

const getJson = async (url) => {
  const response = await globalThis.fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const getFeatherNames = async () => {
  const metadata = await getJson(`${ICONIFY_API}/collection?prefix=feather`);
  return metadata.uncategorized;
};

const getCollection = async (prefix, names) => {
  const chunks = [];
  for (let index = 0; index < names.length; index += 75) {
    chunks.push(names.slice(index, index + 75));
  }

  const responses = await Promise.all(
    chunks.map((chunk) =>
      getJson(
        `${ICONIFY_API}/${prefix}.json?icons=${encodeURIComponent(chunk.join(","))}`,
      ),
    ),
  );
  const first = responses[0];
  const icons = Object.assign(
    {},
    ...responses.map((response) => response.icons),
  );
  const missing = names.filter((name) => !icons[name]);
  if (missing.length > 0) {
    throw new Error(`Missing ${prefix} icons: ${missing.join(", ")}`);
  }
  return {
    prefix,
    icons,
    width: first.width,
    height: first.height,
  };
};

requestedIcons.feather = await getFeatherNames();
const collections = Object.fromEntries(
  await Promise.all(
    Object.entries(requestedIcons).map(async ([prefix, names]) => [
      prefix,
      await getCollection(prefix, names),
    ]),
  ),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(collections, null, 2)}\n`);
globalThis.console.log(
  `Generated ${Object.values(collections).reduce((count, collection) => count + Object.keys(collection.icons).length, 0)} embedded icons.`,
);
