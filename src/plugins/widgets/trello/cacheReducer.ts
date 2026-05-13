import { Cache, Card, createList, defaultCache, List } from "./types";

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
    }
  | { type: "ADD"; card: Card; listId: string }
  | { type: "REMOVE_TOP"; listId: string };

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
        updatedLists[target.id] = createList(target.id, target.name);
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

      const movedCard = sourceList.cards[sourceIndex];
      if (!movedCard) {
        return cache;
      }

      // Remove card from source
      const updatedSourceCards = sourceList.cards.filter(
        (_, i) => i !== sourceIndex,
      );

      // Insert into target list
      const updatedTargetCards = [...targetList.cards];
      updatedTargetCards.splice(targetIndex, 0, movedCard);

      const updatedLists = { ...cache.lists };
      if (sourceListId !== targetListId) {
        updatedLists[sourceListId] = {
          ...sourceList,
          cards: updatedSourceCards,
        };
        updatedLists[targetListId] = {
          ...targetList,
          cards: updatedTargetCards,
        };
        return { ...cache, lists: updatedLists };
      }

      // Handle cases where the card is moved lower within the same list
      const newCards = sourceList.cards.filter((_, i) => i !== sourceIndex);

      // If moving the card down in the same list
      const adjusted =
        sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newCards.splice(adjusted, 0, movedCard);
      updatedLists[sourceListId] = { ...sourceList, cards: newCards };

      return { ...cache, lists: updatedLists };
    }
    case "ADD": {
      const targetListId = action.listId;
      const targetList = cache.lists[targetListId];
      const updatedLists = { ...cache.lists };

      const updatedCards = targetList.cards;
      updatedCards.unshift(action.card);
      updatedLists[targetListId] = { ...targetList, cards: updatedCards };
      return { ...cache, lists: updatedLists };
    }
    case "REMOVE_TOP": {
      const targetListId = action.listId;
      const targetList = cache.lists[targetListId];
      const updatedLists = { ...cache.lists };

      const updatedCards = targetList.cards;
      updatedCards.shift();
      updatedLists[targetListId] = { ...targetList, cards: updatedCards };
      return { ...cache, lists: updatedLists };
    }
    default:
      return cache;
  }
}
