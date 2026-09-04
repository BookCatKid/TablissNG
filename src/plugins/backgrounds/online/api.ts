import { Loader } from "../../types";
import { Data, Image } from "./types";

function getStringAtPath(value: unknown, path: string) {
  for (const key of path.trim().split(".")) {
    if (!value || typeof value !== "object") return;
    value = (value as Record<string, unknown>)[key];
  }

  return typeof value === "string" ? value.trim() : undefined;
}

export async function fetchImages(
  { url, jsonPath }: Pick<Data, "url" | "jsonPath">,
  loader: Loader,
): Promise<Image[]> {
  if (!url.trim() || !jsonPath.trim()) return [];

  loader.push();
  try {
    const response = await fetch(url.trim());
    if (!response.ok) return [];

    const imageUrl = getStringAtPath(await response.json(), jsonPath);
    return imageUrl ? [{ url: imageUrl }] : [];
  } catch {
    return [];
  } finally {
    loader.pop();
  }
}
