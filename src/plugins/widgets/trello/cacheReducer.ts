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

      const newSourceItems = sourceList.items.filter(
        (_, i) => i !== sourceIndex,
      );

      let adjacentTarget = targetIndex;
      if (sourceListId === targetListId && sourceIndex < adjacentTarget) {
        adjacentTarget--;
      }

      const newTargetItems = [...targetList.items];
      newTargetItems.splice(adjacentTarget, 0, movedItem);

      const updatedLists = { ...cache.lists };
      updatedLists[sourceListId] = { ...sourceList, items: newSourceItems };
      if (sourceListId !== targetListId) {
        updatedLists[targetListId] = { ...targetList, items: newTargetItems };
      } else {
        updatedLists[sourceListId] = { ...sourceList, items: newTargetItems };
      }

      return { ...cache, lists: updatedLists };
    }
    default:
      return cache;
  }
}
