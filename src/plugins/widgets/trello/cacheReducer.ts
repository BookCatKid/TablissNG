import { Cache, createFList, defaultCache, List } from "./types";

export type CacheReducerAction =
  | { type: "UPDATE"; order: string[]; lists: List[] }
  | { type: "CLEAR" }
  | { type: "TOGGLE"; order: string[]; target: List }
  | {
      type: "MOVE_ITEM";
      sourceListId: string;
      sourceIndex: number;
      targetListId: string;
      targetIndex: number;
    };

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
    case "MOVE_ITEM": {
      const { sourceListId, sourceIndex, targetListId, targetIndex } = action;
      const sourceList = cache.lists[sourceListId];
      const targetList = cache.lists[targetListId];
      if (!sourceList || !targetList) return cache;

      const movedItem = sourceList.items[sourceIndex];
      if (!movedItem) {
        return cache;
      }

      // Remove item from source
      const updatedSourceItems = sourceList.items.filter(
        (_, i) => i !== sourceIndex,
      );

      // Insert into target list
      const updatedTargetItems = [...targetList.items];
      updatedTargetItems.splice(targetIndex, 0, movedItem);

      const updatedLists = { ...cache.lists };
      if (sourceListId !== targetListId) {
        updatedLists[sourceListId] = {
          ...sourceList,
          items: updatedSourceItems,
        };
        updatedLists[targetListId] = {
          ...targetList,
          items: updatedTargetItems,
        };
        return { ...cache, lists: updatedLists };
      }

      // Handle cases where the item is moved lower within the same list
      const newItems = sourceList.items.filter((_, i) => i !== sourceIndex);

      // If moving the card down in the same list
      const adjusted =
        sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newItems.splice(adjusted, 0, movedItem);
      updatedLists[sourceListId] = { ...sourceList, items: newItems };

      return { ...cache, lists: updatedLists };
    }
    default:
      return cache;
  }
}
