import { format } from "date-fns";

import { parseLocalDate } from "../../../utils";
import { API } from "../../types";
import { Data, Image } from "./types";

const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

const httpUrl = (value: unknown): string => {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
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

const parsePicture = (value: unknown): Image => {
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
  const imageUrl =
    httpUrl(entry.hdurl) ||
    httpUrl(html?.querySelector("img")?.getAttribute("src"));
  const videoUrl = httpUrl(
    html
      ?.querySelector("video[src], video source[src], iframe[src]")
      ?.getAttribute("src"),
  );
  const directVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
  const youtubeId = videoUrl.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/,
  )?.[1];
  const isVideo =
    entry.media_type !== "image" && (directVideo || Boolean(youtubeId));
  const thumbnail =
    imageUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");
  if (!isVideo && !imageUrl) {
    throw new Error("NASA APOD returned no usable image or video.");
  }

  return {
    date: entry.date,
    title: plainText(entry.title),
    permalink,
    url: isVideo ? videoUrl : imageUrl,
    hdurl: imageUrl,
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
    return parsePicture(Array.isArray(json) ? json[0] : json);
  } finally {
    loader.pop();
  }
}
