import { fetchImages } from "./api";

const loader = { push: () => {}, pop: () => {} };
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("online/api", () => {
  it("extracts an image URL using object keys and array indexes", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          data: [{ path: "https://example.com/wallpaper.jpg" }],
        }),
      );

    await expect(
      fetchImages(
        { url: "https://example.com/api", jsonPath: "data.0.path" },
        loader,
      ),
    ).resolves.toEqual([{ url: "https://example.com/wallpaper.jpg" }]);
  });

  it("returns no images when the path cannot be resolved", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ data: [] }));

    await expect(
      fetchImages(
        { url: "https://example.com/api", jsonPath: "data.0.path" },
        loader,
      ),
    ).resolves.toEqual([]);
  });
});
