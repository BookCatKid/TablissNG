import { addLink, removeLink, updateLink, reorderLink } from "./actions";
import { reducer } from "./reducer";

describe("links/reducer()", () => {
  it("should add new links", () => {
    expect(reducer([], addLink())).toEqual([
      { id: expect.any(String), url: "https://" },
    ]);
    expect(
      reducer([{ id: "1", url: "https://tabliss.io/" }], { type: "ADD_LINK" }),
    ).toEqual([
      { id: "1", url: "https://tabliss.io/" },
      { id: expect.any(String), url: "https://" },
    ]);
  });

  it("should remove links", () => {
    expect(
      reducer(
        [
          { id: "1", url: "https://tabliss.io/" },
          { id: "2", url: "https://tabliss.io/about.html" },
        ],
        removeLink(0),
      ),
    ).toEqual([{ id: "2", url: "https://tabliss.io/about.html" }]);
  });

  it("should update links", () => {
    expect(
      reducer(
        [
          { id: "1", url: "https://tabliss.io/" },
          { id: "2", url: "https://tabliss.io/about.html" },
        ],
        updateLink(0, { id: "1", name: "Tabliss", url: "https://tabliss.io/" }),
      ),
    ).toEqual([
      { id: "1", name: "Tabliss", url: "https://tabliss.io/" },
      { id: "2", url: "https://tabliss.io/about.html" },
    ]);
  });

  it("should reorder links", () => {
    expect(
      reducer(
        [
          { id: "1", url: "https://tabliss.io/" },
          { id: "2", url: "https://tabliss.io/about.html" },
          { id: "3", url: "https://tabliss.io/support.html" },
        ],
        reorderLink(1, 0),
      ),
    ).toEqual([
      { id: "2", url: "https://tabliss.io/about.html" },
      { id: "1", url: "https://tabliss.io/" },
      { id: "3", url: "https://tabliss.io/support.html" },
    ]);

    expect(
      reducer(
        [
          { id: "1", url: "https://tabliss.io/" },
          { id: "2", url: "https://tabliss.io/about.html" },
          { id: "3", url: "https://tabliss.io/support.html" },
        ],
        reorderLink(1, 2),
      ),
    ).toEqual([
      { id: "1", url: "https://tabliss.io/" },
      { id: "3", url: "https://tabliss.io/support.html" },
      { id: "2", url: "https://tabliss.io/about.html" },
    ]);
  });

  it("should throw on unknown action", () => {
    expect(() => reducer([], { type: "UNKNOWN" } as any)).toThrow();
  });

  it("should handle adding multiple links", () => {
    let state = reducer([], addLink());
    state = reducer(state, addLink());
    state = reducer(state, addLink());
    expect(state).toEqual([
      { id: expect.any(String), url: "https://" },
      { id: expect.any(String), url: "https://" },
      { id: expect.any(String), url: "https://" },
    ]);
  });

  it("should handle removing the last link", () => {
    const state = reducer(
      [{ id: "1", url: "https://tabliss.io/" }],
      removeLink(0),
    );
    expect(state).toEqual([]);
  });

  it("should handle updating a non-existent link", () => {
    const state = reducer(
      [{ id: "1", url: "https://tabliss.io/" }],
      updateLink(1, { id: "2", url: "https://example.com/" }),
    );
    expect(state).toEqual([{ id: "1", url: "https://tabliss.io/" }]);
  });

  it("should handle reordering with invalid indices", () => {
    const state = reducer(
      [
        { id: "1", url: "https://tabliss.io/" },
        { id: "2", url: "https://tabliss.io/about.html" },
      ],
      reorderLink(2, 0),
    );
    expect(state).toEqual([
      { id: "1", url: "https://tabliss.io/" },
      { id: "2", url: "https://tabliss.io/about.html" },
    ]);
  });

  it("should handle reordering to the same position", () => {
    const state = reducer(
      [
        { id: "1", url: "https://tabliss.io/" },
        { id: "2", url: "https://tabliss.io/about.html" },
      ],
      reorderLink(1, 1),
    );
    expect(state).toEqual([
      { id: "1", url: "https://tabliss.io/" },
      { id: "2", url: "https://tabliss.io/about.html" },
    ]);
  });
});
