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
  it("migrates a real pre-overhaul TablissNG setup without changing icon sizes", () => {
    // Representative entries from this public v3 export:
    // https://github.com/chpaxson/chpaxson.github.io/blob/35e83295c7c4a9aa3a773c6325fba40b045b7a82/data/new-tab-icons/tablissng.json
    const data = {
      columns: 6,
      conserveAspectRatio: false,
      customHeight: 24,
      customWidth: 24,
      iconifyIdentifier: "feather:",
      linkOpenStyle: true,
      links: [
        {
          icon: "_favicon_favicone",
          iconSize: 128,
          id: "meuiki535j5j74417ts0",
          lastUsed: 1760166168858,
          name: "Personal",
          url: "https://mail.google.com/mail/u/0/#inbox",
        },
        {
          IconStringIco:
            "https://chpaxson.github.io/data/new-tab-icons/gmessages.svg",
          customWidth: 24,
          icon: "_custom_ico",
          iconCacheKey: "icon_1746214785515",
          iconSize: 32,
          id: "meuiki53a3nnk3h4w1n4",
          lastUsed: 1760145277520,
          name: "Messages",
          url: "https://messages.google.com/web",
        },
        {
          icon: "_favicon_google",
          iconSize: 64,
          id: "meuiki5334mww9btioh14",
          lastUsed: 1757117580517,
          name: "Music",
          url: "https://music.youtube.com/",
        },
      ],
      linksNumbered: false,
      visible: true,
    } as unknown as Data;

    const result = migrateLinks(data, {});

    expect(result.data).toMatchObject({
      columns: 6,
      linkOpenStyle: true,
      linksNumbered: false,
      sortBy: "none",
      centerLinks: false,
      visible: true,
    });
    expect(result.data).not.toHaveProperty("customWidth");
    expect(result.data).not.toHaveProperty("customHeight");
    expect(result.data).not.toHaveProperty("iconifyIdentifier");
    expect(result.data.links).toEqual([
      {
        id: "meuiki535j5j74417ts0",
        lastUsed: 1760166168858,
        name: "Personal",
        url: "https://mail.google.com/mail/u/0/#inbox",
        customWidth: 128,
        customHeight: 128,
        iconConfig: {
          type: "favicon",
          provider: "favicone",
          resolution: 128,
        },
      },
      {
        id: "meuiki53a3nnk3h4w1n4",
        lastUsed: 1760145277520,
        name: "Messages",
        url: "https://messages.google.com/web",
        customWidth: 24,
        customHeight: 24,
        iconConfig: {
          type: "custom_image_url",
          url: "https://chpaxson.github.io/data/new-tab-icons/gmessages.svg",
        },
      },
      {
        id: "meuiki5334mww9btioh14",
        lastUsed: 1757117580517,
        name: "Music",
        url: "https://music.youtube.com/",
        customWidth: 64,
        customHeight: 64,
        iconConfig: {
          type: "favicon",
          provider: "google",
          resolution: 64,
        },
      },
    ]);
  });

  it("migrates old upstream exports with missing IDs and widget defaults", () => {
    // Shape used by public Tabliss v2/v3 exports, including:
    // https://github.com/GVodyanov/Lime_Gruv_i3WM/blob/6b1c744354663d3a6a1d718756a808b1d23ce916/tabliss.json
    const data = {
      columns: 2,
      links: [
        { url: "https://github.com", name: "GitHub", icon: "github" },
        { url: "https://stackoverflow.com", icon: "settings" },
      ],
      visible: true,
      linkOpenStyle: false,
    } as unknown as Data;

    const result = migrateLinks(data, {});

    expect(result.data).toMatchObject({
      columns: 2,
      visible: true,
      linkOpenStyle: false,
      linksNumbered: false,
      sortBy: "none",
      centerLinks: false,
    });
    expect(result.data.links.map(({ iconConfig }) => iconConfig)).toEqual([
      { type: "feather", value: "feather:github" },
      { type: "feather", value: "feather:settings" },
    ]);
    expect(result.data.links.every(({ id }) => Boolean(id))).toBe(true);
  });

  it("preserves sizes from the oldest customIconSize schema", () => {
    const data = {
      columns: 1,
      customIconSize: 40,
      links: [
        {
          url: "https://example.com",
          icon: "_custom_svg",
          SvgString: '<svg viewBox="0 0 1 1"><path d="M0 0" /></svg>',
        },
      ],
      visible: true,
      linkOpenStyle: false,
    } as unknown as Data;

    const result = migrateLinks(data, {});

    expect(result.data.links[0]).toMatchObject({
      customWidth: 40,
      customHeight: 40,
      iconConfig: { type: "custom_svg" },
    });
    expect(result.data).not.toHaveProperty("customIconSize");
  });

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

  it("removes incomplete recognized legacy icon metadata", () => {
    const result = migrateLinks(
      dataWithLink({
        id: "incomplete-custom-ico",
        url: "https://example.com",
        icon: "_custom_ico",
        iconifyValue: "log-in",
        iconifyIdentifier: "feather:",
      }),
      {},
    );

    expect(result.data.links[0]).toEqual({
      id: "incomplete-custom-ico",
      url: "https://example.com",
    });
    expect(result.data.links[0]).not.toHaveProperty("iconConfig");
    expect(result.dataChanged).toBe(true);
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
