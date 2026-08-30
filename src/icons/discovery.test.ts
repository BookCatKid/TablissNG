import { browseIconSet, listIconSets, searchIcons } from "./discovery";

const requestWith = (body: unknown) =>
  rstest.fn(async () =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 })),
  ) as unknown as typeof fetch;

describe("Iconify discovery", () => {
  it("sorts available icon sets by their display names", async () => {
    const request = requestWith({
      zed: { name: "Zed", total: 10 },
      alpha: { name: "Alpha", total: 20 },
    });

    await expect(listIconSets(undefined, request)).resolves.toEqual([
      { prefix: "alpha", name: "Alpha", total: 20 },
      { prefix: "zed", name: "Zed", total: 10 },
    ]);
  });

  it("searches all sets or one selected set", async () => {
    const request = requestWith({ icons: ["mdi:home"], total: 1 });

    await expect(
      searchIcons("home", "mdi", undefined, request),
    ).resolves.toEqual({ icons: ["mdi:home"], total: 1 });
    expect(request).toHaveBeenCalledWith(
      "https://api.iconify.design/search?query=home&limit=96&prefix=mdi",
      { signal: undefined },
    );
  });

  it("flattens categorized and uncategorized icons when browsing a set", async () => {
    const request = requestWith({
      total: 3,
      uncategorized: ["alert"],
      categories: { Navigation: ["arrow-right", "alert"] },
    });

    await expect(browseIconSet("sample", undefined, request)).resolves.toEqual({
      icons: ["sample:alert", "sample:arrow-right"],
      total: 3,
    });
  });
});
