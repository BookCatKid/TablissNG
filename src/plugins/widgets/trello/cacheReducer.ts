import { Cache, createFList, defaultCache, List } from "./types";

export type CacheReducerAction =
  | { type: "UPDATE"; order: string[]; lists: List[] }
  | { type: "CLEAR" }
  | { type: "TOGGLE"; order: string[]; target: List };

export function cacheReducer(cache: Cache, action: CacheReducerAction): Cache {
  switch (action.type) {
    case "UPDATE":
      return {
        order: action.order,
        lists: Object.fromEntries(action.lists.map((l) => [l.id, l])),
      };
    case "CLEAR":
      return defaultCache;
    case "TOGGLE": {
      const target = action.target;
      const order = action.order;
      const operation = target.selected ? "REMOVE" : "ADD";
      const updatedLists = { ...cache.lists };

      // Add or remove list from UI
      if (operation === "ADD") {
        updatedLists[target.id] = createFList(target.id, target.name);
      } else {
        delete updatedLists[target.id];
      }

      return {
        order: order,
        lists: updatedLists,
      };
    }
    default:
      return cache;
  }
}
