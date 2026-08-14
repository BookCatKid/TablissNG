import {
  areLastUsedCacheEqual,
  areLinksEqual,
  type Cache,
  getCachedIcon,
  getLastUsed,
  LAST_USED_CACHE_KEY,
  type Link,
  normalizeLinks,
  sanitizeLink,
  setLastUsed,
} from "./types";

const link: Link = {
  id: "link-1",
  url: "https://example.com",
};

describe("links last-used cache", () => {
  it("prefers the local cache over legacy synced data", () => {
    const cache: Cache = {
      [LAST_USED_CACHE_KEY]: {
        type: "lastUsed",
        data: { "link-1": 200 },
        size: 0,
      },
    };

    expect(getLastUsed({ ...link, lastUsed: 100 }, cache)).toBe(200);
  });

  it("falls back to a legacy timestamp while migrating", () => {
    expect(getLastUsed({ ...link, lastUsed: 100 }, {})).toBe(100);
    expect(getLastUsed(link, {})).toBe(0);
  });

  it("updates only the local cache and preserves icon entries", () => {
    const cache: Cache = {
      icon_1: { type: "image", data: "data:image/png;base64,abc", size: 3 },
    };

    const updated = setLastUsed(cache, link.id, 300);

    expect(updated.icon_1).toEqual(cache.icon_1);
    expect(updated[LAST_USED_CACHE_KEY]).toEqual({
      type: "lastUsed",
      data: { "link-1": 300 },
      size: 0,
    });
  });

  it("removes inactive custom icon payloads before saving link data", () => {
    expect(
      sanitizeLink({
        ...link,
        icon: "_feather",
        SvgString: "<svg>large legacy payload</svg>",
        IconStringIco: "data:image/png;base64,legacy",
        iconCacheKey: "old-icon",
      }),
    ).toEqual({ ...link, icon: "_feather" });
  });

  it("does not expose the metadata cache entry as an icon", () => {
    const cache: Cache = {
      [LAST_USED_CACHE_KEY]: {
        type: "lastUsed",
        data: { "link-1": 1 },
        size: 0,
      },
    };

    expect(getCachedIcon(cache, LAST_USED_CACHE_KEY)).toBeUndefined();
  });
});

describe("link normalization", () => {
  it("removes legacy fields and gives duplicate links stable cache keys", () => {
    const normalized = normalizeLinks([
      {
        ...link,
        id: "duplicate",
        icon: "_custom_svg",
        lastUsed: 100,
        SvgString: "<svg />",
      },
      { ...link, id: "duplicate", url: "https://second.example" },
    ]);

    expect(normalized[0].id).not.toBe("duplicate");
    expect(normalized[1].id).not.toBe("duplicate");
    expect(normalized[0].iconCacheKey).toMatch(/^svg_/);
    expect(normalized[0].lastUsed).toBeUndefined();
    expect(normalized[0].SvgString).toBeUndefined();
  });

  it("uses targeted equality checks for links and last-used cache entries", () => {
    const lastUsed = {
      type: "lastUsed" as const,
      data: { "link-1": 100 },
      size: 0 as const,
    };

    expect(areLinksEqual([link], [{ ...link }])).toBe(true);
    expect(areLinksEqual([link], [{ ...link, name: "Changed" }])).toBe(false);
    expect(areLastUsedCacheEqual(lastUsed, { ...lastUsed })).toBe(true);
    expect(
      areLastUsedCacheEqual(lastUsed, {
        ...lastUsed,
        data: { "link-1": 200 },
      }),
    ).toBe(false);
  });
});
