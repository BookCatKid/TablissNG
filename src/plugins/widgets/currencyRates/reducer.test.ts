import { addPair, removePair, reorderPair, updatePair } from "./actions";
import { reducer } from "./reducer";

describe("currencyRates/reducer", () => {
  it("adds a pair with sensible defaults", () => {
    const state = reducer([], addPair());
    expect(state).toEqual([
      {
        id: expect.any(String),
        from: "bitcoin",
        to: "usd",
        showChange: true,
      },
    ]);
  });

  it("removes a pair by id", () => {
    const state = reducer(
      [
        { id: "1", from: "bitcoin", to: "usd" },
        { id: "2", from: "ethereum", to: "eur" },
      ],
      removePair("1"),
    );
    expect(state).toEqual([{ id: "2", from: "ethereum", to: "eur" }]);
  });

  it("updates a pair by id, merging changes", () => {
    const state = reducer(
      [{ id: "1", from: "bitcoin", to: "usd", amount: 1 }],
      updatePair("1", { to: "rub", amount: 2 }),
    );
    expect(state).toEqual([{ id: "1", from: "bitcoin", to: "rub", amount: 2 }]);
  });

  it("reorders pairs by index", () => {
    const state = reducer(
      [
        { id: "1", from: "bitcoin", to: "usd" },
        { id: "2", from: "ethereum", to: "eur" },
        { id: "3", from: "solana", to: "rub" },
      ],
      reorderPair(0, 2),
    );
    expect(state.map((pair) => pair.id)).toEqual(["2", "3", "1"]);
  });

  it("ignores an out-of-bounds reorder", () => {
    const initial = [{ id: "1", from: "bitcoin", to: "usd" }];
    expect(reducer(initial, reorderPair(0, 5))).toEqual(initial);
    expect(reducer(initial, reorderPair(-1, 0))).toEqual(initial);
  });

  it("throws on unknown action", () => {
    expect(() => reducer([], { type: "UNKNOWN" } as any)).toThrow();
  });
});
