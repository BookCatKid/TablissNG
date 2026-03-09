import { format } from "date-fns";
import { parseLocalDate } from "../../../utils";
import { Data, Image } from "./types";

const API_URL = "https://bing.npanuhin.me";

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const toImageFromNp = (entry: any): Image => {
  return {
    url: entry.url,
    title: entry.title ?? null,
    copyright: entry.copyright ?? null,
    date: entry.date ? new Date(entry.date) : new Date(),
  };
};

export async function getImage(data: Data, loader: any): Promise<Image> {
  loader.push();
  try {
    const locale = data.locale || "US/en";

    if (data.date === "today") {
      // Fetch the main API file and return the newest (last) entry
      const url = `${API_URL}/${locale}.json`;
      const json = await fetchJson(url);
      if (!Array.isArray(json) || json.length === 0)
        throw new Error("No images available");
      const entry = json[json.length - 1];
      return toImageFromNp(entry);
    } else {
      if (!data.customDate) throw new Error("No date provided");
      const localDate = parseLocalDate(data.customDate);
      const target = format(localDate, "yyyy-MM-dd");
      const year = format(localDate, "yyyy");

      const yearUrl = `${API_URL}/${locale}.${year}.json`;
      const json = await fetchJson(yearUrl);

      if (!Array.isArray(json)) throw new Error("Invalid response from API");
      const entry = json.find((e: any) => e.date === target);
      if (!entry) throw new Error("Image not found for date");
      return toImageFromNp(entry);
    }
  } finally {
    loader.pop();
  }
}

export default getImage;
