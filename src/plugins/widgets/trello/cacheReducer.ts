import {
  Cache,
  createUIList,
  defaultCache,
  SettingsListOption,
  UIList,
} from "./types";

export type CacheReducerAction =
  | { type: "UPDATE"; order: SettingsListOption[]; lists: UIList[] }
  | { type: "CLEAR" }
  | { type: "TOGGLE"; order: SettingsListOption[]; target: SettingsListOption };

export function cacheReducer(cache: Cache, action: CacheReducerAction): Cache {
  switch (action.type) {
    case "UPDATE":
      return {
        order: action.order,
        lists: Object.fromEntries(action.lists.map((l) => [l.listId, l])),
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
        updatedLists[target.id] = createUIList(target.id);
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
