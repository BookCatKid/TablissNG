import { Cache, Card, createList, defaultCache, List } from "../types";

export type CacheReducerAction =
  | { type: "UPDATE_LISTS"; order: string[]; lists: List[] }
  | { type: "CLEAR" }
  | { type: "TOGGLE_LIST_VISIBILITY"; order: string[]; target: List }
  | {
      type: "MOVE_CARD";
      sourceListId: string;
      sourceIndex: number;
      targetListId: string;
      targetIndex: number;
    }
  | { type: "ADD_CARD"; card: Card; listId: string; position?: number }
  | { type: "EDIT_CARD_NAME"; cardId: string; listId: string; name: string }
  | { type: "DELETE_CARD"; cardId: string; listId: string };

export function cacheReducer(cache: Cache, action: CacheReducerAction): Cache {
  switch (action.type) {
    case "UPDATE_LISTS":
      return {
        order: action.order,
        lists: Object.fromEntries(action.lists.map((l) => [l.id, l])),
      };
    case "CLEAR":
      return defaultCache;
    case "TOGGLE_LIST_VISIBILITY": {
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
    case "MOVE_CARD": {
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
    case "ADD_CARD": {
      const { card, listId } = action;
      const list = cache.lists[listId];
      if (!list) return cache;

      const updatedLists = { ...cache.lists };
      const updatedCards = [...list.cards];

      if (action.position !== undefined) {
        updatedCards.splice(action.position, 0, card);
      } else {
        updatedCards.unshift(card);
      }

      updatedLists[listId] = { ...list, cards: updatedCards };
      return { ...cache, lists: updatedLists };
    }
    case "EDIT_CARD_NAME": {
      const { cardId, listId, name } = action;
      const list = cache.lists[listId];
      if (!list) return cache;

      const updatedCards = list.cards.map((c) =>
        c.id === cardId ? { ...c, name } : c,
      );

      const updatedLists = {
        ...cache.lists,
        [listId]: { ...list, cards: updatedCards },
      };

      return { ...cache, lists: updatedLists };
    }
    case "DELETE_CARD": {
      const { cardId: deleteCardId, listId: deleteListId } = action;
      const deleteList = cache.lists[deleteListId];
      if (!deleteList) return cache;

      const filteredCards = deleteList.cards.filter(
        (c) => c.id !== deleteCardId,
      );

      const updatedListsAfterDelete = {
        ...cache.lists,
        [deleteListId]: { ...deleteList, cards: filteredCards },
      };

      return { ...cache, lists: updatedListsAfterDelete };
    }
    default:
      return cache;
  }
}
