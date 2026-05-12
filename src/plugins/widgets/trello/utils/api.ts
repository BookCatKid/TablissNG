import {
  Board,
  createList,
  Item,
  List,
  TrelloBoardResponse,
  TrelloItemsResponse,
  TrelloListResponse,
  TrelloSession,
} from "../types";

// TODO add pagination for boards and list fetches
// Potentially infinite scroll

/**
 * Make authenticated call to Trello's API
 * and transform the response into a TData array
 */
const trelloFetch = async <TResponse, TData>(
  path: string,
  session: TrelloSession,
  transform: (data: TResponse) => TData,
) => {
  const url = `https://api.trello.com/1/${path}?key=${TRELLO_API_KEY}&token=${session.accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data: TResponse = await response.json();
  return transform(data);
};

/**
 * Fetch boards all boards owned by the current authenticated user
 */
export const getBoards = async (
  session: TrelloSession,
): Promise<Board[] | null> => {
  return await trelloFetch<TrelloBoardResponse[], Board[]>(
    `members/${session.userId}/boards`,
    session,
    (data) => data.map((item) => ({ id: item.id, name: item.name }) as Board),
  );
};

/**
 * Fetch lists under a specific board owned by the authenticated user
 */
export const getLists = async (
  boardId: string,
  session: TrelloSession,
): Promise<List[] | null> => {
  return await trelloFetch<TrelloListResponse[], List[]>(
    `boards/${boardId}/lists`,
    session,
    (data) => data.map((item) => createList(item.id, item.name)),
  );
};

/**
 * Fetch items under a specific list owned by the authenticated user
 * @param listId
 * @param session
 * @returns
 */
export const getItems = async (
  listId: string,
  session: TrelloSession,
): Promise<Item[] | null> => {
  return await trelloFetch<TrelloItemsResponse[], Item[]>(
    `lists/${listId}/cards`,
    session,
    (data) =>
      data.map(
        (item) =>
          ({
            id: item.id,
            name: item.name,
            position: item.pos,
            labels: item.labels,
          }) as Item,
      ),
  );
};

/**
 * Move a card to a different list
 */
export const moveCardToList = async (
  cardId: string,
  insertIndex: number,
  targetListId: string,
  listItems: Item[],
  session: TrelloSession,
): Promise<boolean> => {
  // listItems should already have the card excluded so indices are clean
  const getOrNull = <T>(arr: T[], index: number): T | null =>
    index >= 0 && index < arr.length ? arr[index] : null;

  const prevItem = getOrNull(listItems, insertIndex - 1);
  const nextItem = getOrNull(listItems, insertIndex);

  let newPosition: number;
  if (!prevItem && !nextItem) {
    // Only card in the list
    newPosition = 65536;
  } else if (!prevItem) {
    // Inserting at the top
    newPosition = nextItem!.position / 2;
  } else if (!nextItem) {
    // Inserting at the bottom
    newPosition = prevItem.position + 65536;
  } else {
    // Inserting between two cards
    newPosition = (prevItem.position + nextItem.position) / 2;
  }

  const response = await fetch(`https://api.trello.com/1/cards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idList: targetListId,
      pos: newPosition,
      key: TRELLO_API_KEY,
      token: session.accessToken,
    }),
  });

  return response.ok;
};
