import { format } from "date-fns";

import { parseLocalDate } from "../../../utils";
import { API } from "../../types";
import { Data, Image } from "./types";

const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
export const MEDIA_VERSION = 1;

const httpUrl = (value: unknown): string => {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
};

const imageUrl = (value: unknown): string => {
  const url = httpUrl(value);
  if (!url) return "";
  const parsed = new URL(url);
  if (
    /\/(?:news-thumbnail|NASA-Meatball-Feature\d*)\.(?:png|jpe?g)$/i.test(
      parsed.pathname,
    )
  )
    return "";
  if (
    /\.tiff?$/i.test(parsed.pathname) &&
    parsed.hostname === "assets.science.nasa.gov"
  ) {
    parsed.pathname = parsed.pathname.replace(
      /^\/content\/dam\/science\//,
      "/dynamicimage/assets/science/",
    );
    parsed.searchParams.set("w", "1920");
    parsed.searchParams.set("fit", "clip");
  }
  return parsed.href;
};

const plainText = (value: unknown): string => {
  if (typeof value !== "string") return "";
  if (!/[<&]/.test(value)) return value.trim();
  return (
    new DOMParser()
      .parseFromString(value, "text/html")
      .body.textContent?.trim() || ""
  );
};

const parsePicture = async (value: unknown): Promise<Image> => {
  if (!value || typeof value !== "object") {
    throw new Error("NASA APOD returned no picture.");
  }
  const entry = value as Record<string, unknown>;
  const permalink = httpUrl(entry.permalink);
  if (
    typeof entry.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
    !permalink
  ) {
    throw new Error("NASA APOD returned an invalid picture.");
  }

  const html =
    typeof entry.basic_html === "string"
      ? new DOMParser().parseFromString(entry.basic_html, "text/html")
      : undefined;
  const contentImage = imageUrl(
    html?.querySelector("img")?.getAttribute("src"),
  );
  const featuredImage = imageUrl(entry.hdurl);
  const pictureUrl = /\.gif(?:\?|$)/i.test(contentImage)
    ? contentImage
    : featuredImage || contentImage;
  const videoUrl = httpUrl(
    html
      ?.querySelector("video[src], video source[src], iframe[src]")
      ?.getAttribute("src"),
  );
  const directVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
  const youtubeId = videoUrl.match(
    /^https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/,
  )?.[1];
  const isVideo =
    entry.media_type !== "image" && (directVideo || Boolean(youtubeId));
  let thumbnail =
    pictureUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");
  const vimeoId = videoUrl.match(
    /^https?:\/\/player\.vimeo\.com\/video\/(\d+)/,
  )?.[1];
  if (!thumbnail && vimeoId) {
    const params = new URLSearchParams({
      url: `https://vimeo.com/${vimeoId}`,
      width: "1920",
    });
    const response = await fetch(`https://vimeo.com/api/oembed.json?${params}`);
    if (!response.ok)
      throw new Error(
        `NASA APOD video thumbnail request failed (${response.status}).`,
      );
    const metadata: { thumbnail_url?: unknown } = await response.json();
    thumbnail = imageUrl(metadata.thumbnail_url);
  }
  const resolvedImage = isVideo ? thumbnail : pictureUrl || thumbnail;
  if (!isVideo && !resolvedImage) {
    throw new Error("NASA APOD returned no usable image or video.");
  }
  if (!(isVideo && directVideo)) {
    const image = document.createElement("img");
    image.src = resolvedImage;
    try {
      await image.decode();
    } catch {
      throw new Error("NASA APOD image could not be loaded.");
    }
  }

  return {
    mediaVersion: MEDIA_VERSION,
    date: entry.date,
    title: plainText(entry.title),
    permalink,
    url: isVideo ? videoUrl : resolvedImage,
    hdurl: isVideo ? pictureUrl : resolvedImage,
    media_type: isVideo ? "video" : "image",
    thumbnail_url: thumbnail,
    copyright: plainText(entry.copyright || entry.credit),
    explanation: plainText(entry.explanation),
  };
};

export async function getPicture(
  data: Data,
  loader: API["loader"],
): Promise<Image> {
  const url =
    data.date === "custom" && data.customDate
      ? `${API_URL}/${format(parseLocalDate(data.customDate), "yyMMdd")}`
      : `${API_URL}?per_page=1`;

  loader.push();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA APOD request failed (${res.status}).`);
    const json: unknown = await res.json();
    return await parsePicture(Array.isArray(json) ? json[0] : json);
  } finally {
    loader.pop();
  }
}
