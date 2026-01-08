import {
  Board,
  Item,
  List,
  TrelloBoardResponse,
  TrelloItemsResponse,
  TrelloListResponse,
  TrelloSession,
} from "../types";

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

export const getBoards = async (session: TrelloSession) => {
  return trelloFetch<TrelloBoardResponse[], Board[]>(
    `members/${session.userId}/boards`,
    session,
    (data) => data.map((item) => ({ id: item.id, name: item.name }) as Board),
  );
};

export const getLists = async (boardId: string, session: TrelloSession) => {
  return trelloFetch<TrelloListResponse[], List[]>(
    `boards/${boardId}/lists`,
    session,
    (data) =>
      data.map(
        (item) => ({ id: item.id, name: item.name, watch: false }) as List,
      ),
  );
};

export const getItems = async (listId: string, session: TrelloSession) => {
  return trelloFetch<TrelloItemsResponse[], Item[]>(
    `lists/${listId}/cards`,
    session,
    (data) =>
      data.map(
        (item) =>
          ({ id: item.id, name: item.name, labels: item.labels }) as Item,
      ),
  );
};
