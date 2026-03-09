import { API } from "../../types";
import { Palette } from "./types";

// Get random color palette
async function getRandomPalette() {
  try {
    const data = {
      model: "default",
      input: ["N", "N", "N", "N", "N"],
    };
    // HTTP is intentional as colormind doesn't support HTTPS
    const res = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const body = await res.json();

    if (!body || !Array.isArray(body.result)) {
      throw new Error("Invalid API response format");
    }

    return {
      palette: body.result,
    };
  } catch (err) {
    console.error("Colormind API error:", err);
    throw err;
  }
}

export async function getRandomColorPalette(
  loader: API["loader"],
): Promise<Palette> {
  loader.push();

  try {
    const palette = await getRandomPalette();
    return {
      ...palette,
      timestamp: Date.now(),
    };
  } finally {
    loader.pop();
  }
}
