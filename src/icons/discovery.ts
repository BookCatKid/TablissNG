const ICONIFY_API = "https://api.iconify.design";

export type IconSet = {
  prefix: string;
  name: string;
  total: number;
  category?: string;
};

export type IconResults = {
  icons: string[];
  total: number;
};

type Request = typeof fetch;

type IconSetInfo = {
  name?: string;
  total?: number;
  category?: string;
};

type SearchResponse = {
  icons?: string[];
  total?: number;
};

type CollectionResponse = {
  total?: number;
  uncategorized?: string[];
  categories?: Record<string, string[]>;
};

const getJson = async <T>(
  path: string,
  signal?: AbortSignal,
  request: Request = fetch,
): Promise<T> => {
  const response = await request(`${ICONIFY_API}${path}`, { signal });
  if (!response.ok)
    throw new Error(`Iconify request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

export const listIconSets = async (
  signal?: AbortSignal,
  request?: Request,
): Promise<IconSet[]> => {
  const collections = await getJson<Record<string, IconSetInfo>>(
    "/collections",
    signal,
    request,
  );

  return Object.entries(collections)
    .map(([prefix, info]) => ({
      prefix,
      name: info.name ?? prefix,
      total: info.total ?? 0,
      category: info.category,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const searchIcons = async (
  query: string,
  prefix?: string,
  signal?: AbortSignal,
  request?: Request,
): Promise<IconResults> => {
  const params = new URLSearchParams({ query, limit: "96" });
  if (prefix) params.set("prefix", prefix);
  const response = await getJson<SearchResponse>(
    `/search?${params}`,
    signal,
    request,
  );
  return {
    icons: response.icons ?? [],
    total: response.total ?? 0,
  };
};

export const browseIconSet = async (
  prefix: string,
  signal?: AbortSignal,
  request?: Request,
): Promise<IconResults> => {
  const response = await getJson<CollectionResponse>(
    `/collection?prefix=${encodeURIComponent(prefix)}`,
    signal,
    request,
  );
  const names = new Set(response.uncategorized ?? []);
  for (const category of Object.values(response.categories ?? {})) {
    for (const name of category) names.add(name);
  }
  const icons = Array.from(names)
    .sort()
    .map((name) => `${prefix}:${name}`);
  return { icons, total: response.total ?? icons.length };
};
