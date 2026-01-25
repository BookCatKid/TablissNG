import { API } from "../../types";
import { Data, Gif } from "./types";

/**
 * Base function to fetch from Giphy API
 */
async function giphyFetch(
  endpoint: string,
  params: Record<string, string>,
  loader: API["loader"],
) {
  if (!GIPHY_API_KEY) {
    throw new Error("You must set the GIPHY_API_KEY environment variable.");
  }

  loader.push();
  try {
    const searchParams = new URLSearchParams({
      api_key: GIPHY_API_KEY,
      ...params,
    });

    const url = `https://api.giphy.com/v1/gifs/${endpoint}?${searchParams.toString()}`;
    const res = await (await fetch(url)).json();

    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
      throw new Error("No GIFs found.");
    }
    return res;
  } finally {
    loader.pop();
  }
}

/**
 * Map Giphy API response item to our Gif type
 */
function mapGif(gif: any): Gif {
  return {
    url: gif.images.original.webp,
    link: gif.url,
    title: gif.title,
    username: gif.user?.display_name || gif.username,
    userLink: gif.user?.profile_url,
  };
}

export async function getGifs(
  { by, tag, nsfw }: Data,
  loader: API["loader"],
): Promise<Gif[]> {
  const terms =
    tag
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) || [];
  const rating = nsfw ? "r" : "g";
  const count = 10;
  const searchTerm = terms[Math.floor(Math.random() * terms.length)];

  if (by === "trending") {
    const res = await giphyFetch(
      "trending",
      { rating, limit: String(count) },
      loader,
    );
    return res.data.map(mapGif);
  }

  if (!searchTerm) return [];

  if (by === "search") {
    const res = await giphyFetch(
      "search",
      { q: searchTerm, rating, limit: String(count) },
      loader,
    );
    return res.data.map(mapGif);
  }

  const initialRes = await giphyFetch(
    "search",
    { q: searchTerm, rating, limit: "1" },
    loader,
  );
  const totalCount = initialRes.pagination?.total_count || 0;
  const maxOffset = Math.min(totalCount - count, 4999);
  const randomOffset =
    maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;

  const res = await giphyFetch(
    "search",
    {
      q: searchTerm,
      rating,
      limit: String(count),
      offset: String(randomOffset),
    },
    loader,
  );
  return res.data.map(mapGif);
}
