import { format } from "date-fns";

import { parseLocalDate } from "../../../utils";
import { API } from "../../types";
import { Data, Image } from "./types";

const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
export const MEDIA_VERSION = 2;

const withAbort = <T>(operation: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    operation.then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
    if (signal.aborted) onAbort();
  });

const loadImage = async (url: string, signal: AbortSignal) => {
  const image = document.createElement("img");
  image.src = url;
  try {
    await withAbort(image.decode(), signal);
  } catch (error) {
    throw new Error("NASA APOD image could not be loaded.", { cause: error });
  } finally {
    image.removeAttribute("src");
  }
};

const loadVideo = async (url: string, signal: AbortSignal) => {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  const loaded = new Promise<void>((resolve, reject) => {
    const fail = () =>
      reject(new Error("NASA APOD video could not be loaded."));
    video.onloadeddata = () => (video.videoWidth > 0 ? resolve() : fail());
    video.onerror = fail;
  });
  video.src = url;
  try {
    await withAbort(loaded, signal);
  } finally {
    video.onloadeddata = null;
    video.onerror = null;
    video.removeAttribute("src");
    video.load();
  }
};

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

const parsePicture = async (
  value: unknown,
  signal: AbortSignal,
): Promise<Image> => {
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
  let isVideo =
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
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?${params}`,
      { signal },
    );
    if (!response.ok)
      throw new Error(
        `NASA APOD video thumbnail request failed (${response.status}).`,
      );
    const metadata: { thumbnail_url?: unknown } = await response.json();
    thumbnail = imageUrl(metadata.thumbnail_url);
  }
  if (isVideo && directVideo) {
    try {
      await loadVideo(videoUrl, signal);
    } catch (error) {
      if (signal.aborted || !thumbnail) throw error;
      isVideo = false;
    }
  }
  const resolvedImage = isVideo ? thumbnail : pictureUrl || thumbnail;
  if (!isVideo && !resolvedImage) {
    throw new Error("NASA APOD returned no usable image or video.");
  }
  if (!(isVideo && directVideo)) {
    await loadImage(resolvedImage, signal);
  }

  const credit = entry.copyright || entry.credit;
  const creditLink =
    typeof credit === "string"
      ? new DOMParser()
          .parseFromString(credit, "text/html")
          .querySelector("a[href]")
          ?.getAttribute("href")
      : undefined;

  return {
    mediaVersion: MEDIA_VERSION,
    date: entry.date,
    title: plainText(entry.title),
    permalink,
    url: isVideo ? videoUrl : resolvedImage,
    hdurl: isVideo ? pictureUrl : resolvedImage,
    media_type: isVideo ? "video" : "image",
    thumbnail_url: thumbnail,
    copyright: plainText(credit),
    copyrightUrl: httpUrl(creditLink) || undefined,
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

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  loader.push();
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`NASA APOD request failed (${res.status}).`);
    const json: unknown = await res.json();
    return await parsePicture(
      Array.isArray(json) ? json[0] : json,
      controller.signal,
    );
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("NASA APOD request timed out.", { cause: error });
    throw error;
  } finally {
    window.clearTimeout(timeout);
    loader.pop();
  }
}
