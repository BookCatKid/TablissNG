import {
  Board,
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
 * @param path
 * @param session
 * @param transform
 * @returns
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
 * @param session
 * @returns
 */
export const getBoards = async (session: TrelloSession) => {
  return await trelloFetch<TrelloBoardResponse[], Board[]>(
    `members/${session.userId}/boards`,
    session,
    (data) => data.map((item) => ({ id: item.id, name: item.name }) as Board),
  );
};

/**
 * Fetch lists under a specific board owned by the authenticated user
 * @param boardId
 * @param session
 * @returns
 */
export const getLists = async (boardId: string, session: TrelloSession) => {
  return await trelloFetch<TrelloListResponse[], List[]>(
    `boards/${boardId}/lists`,
    session,
    (data) =>
      data.map(
        (item) => ({ id: item.id, name: item.name, watch: false }) as List,
      ),
  );
};

/**
 * Fetch items under a specific list owned by the authenticated user
 * @param listId
 * @param session
 * @returns
 */
export const getItems = async (listId: string, session: TrelloSession) => {
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
 * @param cardId The ID of the card to move
 * @param targetListId The ID of the destination list
 * @param session The Trello session for authentication
 * @returns true if successful, false otherwise
 */
export const moveCardToList = async (
  cardId: string,
  targetListId: string,
  session: TrelloSession,
): Promise<boolean> => {
  const url = `https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${session.accessToken}&idList=${targetListId}`;
  const response = await fetch(url, { method: "PUT" });
  return response.ok;
};
