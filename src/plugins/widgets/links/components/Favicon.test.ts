import { toFaviconProvider } from "./Favicon";

describe("links/toFaviconProvider()", () => {
  it("maps supported legacy provider names and rejects unsupported values", () => {
    expect(toFaviconProvider("_favicon_google")).toBe("google");
    expect(toFaviconProvider("_favicon_duckduckgo")).toBe("duckduckgo");
    expect(toFaviconProvider("_favicon_favicone")).toBe("favicone");
    expect(toFaviconProvider("_default")).toBeUndefined();
    expect(toFaviconProvider("_future_provider")).toBeUndefined();
    expect(toFaviconProvider("constructor")).toBeUndefined();
    expect(toFaviconProvider("toString")).toBeUndefined();
  });
});
