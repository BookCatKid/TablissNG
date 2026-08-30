import { cleanupCache, migrateLinks } from "./migrate";
import { Cache, Data } from "./types";

const dataWithLink = (link: Record<string, unknown>): Data =>
  ({
    columns: 1,
    links: [link],
    visible: true,
    linkOpenStyle: false,
    linksNumbered: false,
    sortBy: "none",
    centerLinks: false,
  }) as unknown as Data;

describe("links/migrateLinks()", () => {
  it.each([
    ["_favicon", "google"],
    ["_favicon_google", "google"],
    ["_favicon_duckduckgo", "duckduckgo"],
    ["_favicon_favicone", "favicone"],
  ] as const)("migrates %s favicon settings", (icon, provider) => {
    const result = migrateLinks(
      dataWithLink({
        id: `legacy-${provider}`,
        url: "https://example.com",
        icon,
        iconSize: 64,
      }),
      {},
    );

    expect(result.data.links[0].iconConfig).toEqual({
      type: "favicon",
      provider,
      resolution: 64,
    });
    expect(result.data.links[0]).not.toHaveProperty("icon");
    expect(result.data.links[0]).not.toHaveProperty("iconSize");
  });

  it("migrates a colon-qualified legacy icon to Iconify", () => {
    const result = migrateLinks(
      dataWithLink({
        id: "legacy-iconify",
        url: "https://example.com",
        icon: "mdi:home",
      }),
      {},
    );

    expect(result.data.links[0]).toEqual({
      id: "legacy-iconify",
      url: "https://example.com",
      iconConfig: { type: "iconify", value: "mdi:home" },
    });
    expect(result.dataChanged).toBe(true);
  });

  it("migrates plain legacy icons and selected Feather icons", () => {
    const data = {
      ...dataWithLink({
        id: "plain",
        url: "https://example.com/plain",
        icon: "arrow-left",
      }),
      links: [
        {
          id: "plain",
          url: "https://example.com/plain",
          icon: "arrow-left",
        },
        {
          id: "picker",
          url: "https://example.com/picker",
          icon: "_feather",
          iconifyIdentifier: "feather:",
          iconifyValue: "heart",
        },
      ],
    } as unknown as Data;

    const result = migrateLinks(data, {});

    expect(result.data.links.map((link) => link.iconConfig)).toEqual([
      { type: "feather", value: "feather:arrow-left" },
      { type: "feather", value: "feather:heart" },
    ]);
  });

  it("migrates custom Iconify, SVG, image URL, and uploaded icons", () => {
    const svg = '<svg viewBox="0 0 1 1"><path d="M0 0" /></svg>';
    const uploadCache: Cache = {
      uploaded: { type: "image", data: "data:image/png;base64,AA==" },
    };
    const data = {
      ...dataWithLink({}),
      links: [
        {
          id: "iconify",
          url: "https://example.com/iconify",
          icon: "_custom_iconify",
          IconString: "mdi:home",
        },
        {
          id: "svg",
          url: "https://example.com/svg",
          icon: "_custom_svg",
          SvgString: svg,
        },
        {
          id: "image",
          url: "https://example.com/image",
          icon: "_custom_ico",
          IconStringIco: "https://example.com/icon.ico",
        },
        {
          id: "upload",
          url: "https://example.com/upload",
          icon: "_custom_upload",
          iconCacheKey: "uploaded",
        },
      ],
    } as unknown as Data;

    const result = migrateLinks(data, uploadCache);

    expect(result.data.links.map((link) => link.iconConfig)).toEqual([
      { type: "iconify", value: "mdi:home" },
      { type: "custom_svg", cacheKey: "links_svg_svg" },
      { type: "custom_image_url", url: "https://example.com/icon.ico" },
      { type: "custom_upload", cacheKey: "uploaded" },
    ]);
    expect(result.cache).toEqual({
      ...uploadCache,
      links_svg_svg: { type: "svg", data: svg },
    });
    expect(result.cacheChanged).toBe(true);
    for (const link of result.data.links) {
      expect(link).not.toHaveProperty("icon");
      expect(link).not.toHaveProperty("IconString");
      expect(link).not.toHaveProperty("SvgString");
      expect(link).not.toHaveProperty("IconStringIco");
      expect(link).not.toHaveProperty("iconCacheKey");
    }
  });

  it("creates IDs only for missing and duplicate IDs", () => {
    const data = {
      ...dataWithLink({}),
      links: [
        { id: "stable", url: "https://example.com/one" },
        { id: "stable", url: "https://example.com/two" },
        { id: "", url: "https://example.com/three" },
      ],
    } as Data;

    const result = migrateLinks(data, {});
    const ids = result.data.links.map((link) => link.id);

    expect(ids[0]).toBe("stable");
    expect(ids[1]).not.toBe("stable");
    expect(ids[2]).not.toBe("");
    expect(new Set(ids).size).toBe(3);
    expect(result.dataChanged).toBe(true);
  });

  it("preserves legacy icon fields when their format is unknown", () => {
    const data = dataWithLink({
      id: "unknown-icon",
      url: "https://example.com",
      icon: "_future_icon",
      IconString: "important legacy data",
    });

    const result = migrateLinks(data, {});

    expect(result.data).toEqual(data);
    expect(result.dataChanged).toBe(false);
  });
});

describe("links/cleanupCache()", () => {
  it("keeps referenced SVG and upload entries while deleting orphans", () => {
    const data = {
      ...dataWithLink({}),
      links: [
        {
          id: "svg",
          url: "https://example.com/svg",
          iconConfig: { type: "custom_svg", cacheKey: "svg-key" },
        },
        {
          id: "upload",
          url: "https://example.com/upload",
          iconConfig: { type: "custom_upload", cacheKey: "upload-key" },
        },
      ],
    } as Data;
    const cache: Cache = {
      "svg-key": { type: "svg", data: "<svg />" },
      "upload-key": { type: "image", data: "data:image/png;base64,AA==" },
      orphan: { type: "ico", data: "data:image/x-icon;base64,AA==" },
    };

    expect(cleanupCache(data, cache)).toEqual({
      cache: {
        "svg-key": cache["svg-key"],
        "upload-key": cache["upload-key"],
      },
      changed: true,
    });
    expect(cache).toHaveProperty("orphan");
  });

  it("reports no change when every cache entry is referenced", () => {
    const data = dataWithLink({
      id: "svg",
      url: "https://example.com",
      iconConfig: { type: "custom_svg", cacheKey: "svg-key" },
    });
    const cache: Cache = {
      "svg-key": { type: "svg", data: "<svg />" },
    };

    expect(cleanupCache(data, cache)).toEqual({ cache, changed: false });
  });
});
