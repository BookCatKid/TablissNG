export type WikipediaSuggestion = {
  id: number;
  key: string;
  title: string;
  excerpt: string;
  matched_title: string;
  anchor: string | null;
  description: string;
  thumbnail: {
    mimetype: string;
    width: number;
    height: number;
    duration: number | null;
    url: string;
  } | null;
};

export type WikipediaSuggestionResult = {
  title: string;
  description?: string;
  excerpt?: string;
  thumbnailUrl?: string;
};

export async function getWikipediaSuggestions(
  query: string,
  url: string,
): Promise<WikipediaSuggestionResult[]> {
  if (query === "") return [];
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `Failed to fetch suggestions wikipedia suggetsions from ${url}`,
    );
  const data = await response.json();
  if (!data.pages || !Array.isArray(data.pages)) return [];
  return data.pages.map((page: WikipediaSuggestion) => ({
    title: page.title,
    description: page.description,
    excerpt: page.excerpt,
    thumbnailUrl: page.thumbnail
      ? page.thumbnail.url.startsWith("http")
        ? page.thumbnail.url
        : `https:${page.thumbnail.url}`
      : undefined,
  }));
}
// For mounting the result
declare global {
  interface Window {
    mountResult?: {
      [id: string]: (data: SuggestionsResult) => void;
    };
  }
}

type SuggestionsResult = {
  [0]: string;
  [1]: string[];
};

export function getSuggestions(query: string, engineUrl: string) {
  return new Promise<string[]>((resolve, reject) => {
    if (!window.mountResult) {
      window.mountResult = {};
    }

    const id = "i" + Math.random().toString(36).slice(2); // Create unique id to return to correct result

    window.mountResult[id] = (data: SuggestionsResult) => {
      // Resolve the suggestions
      resolve(data[1]);

      if (window.mountResult) {
        delete window.mountResult.id;
      }

      const scriptToRemove = document.getElementById("suggestionsQuery" + id);
      if (scriptToRemove !== null) {
        scriptToRemove.remove();
      }
    };

    const scriptToAdd = document.createElement("script");

    scriptToAdd.id = "suggestionsQuery" + id;
    scriptToAdd.onerror = reject;
    scriptToAdd.src = engineUrl
      .replace("{searchTerms}", query)
      .replace("{callback}", `mountResult.${id}`);

    document.head.appendChild(scriptToAdd);
  });
}
