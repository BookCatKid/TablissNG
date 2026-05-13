import {
  Board,
  Card,
  createList,
  List,
  TrelloBoardResponse,
  TrelloCardsResponse,
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
    (data) => data.map((card) => ({ id: card.id, name: card.name }) as Board),
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
    (data) => data.map((card) => createList(card.id, card.name)),
  );
};

/**
 * Fetch cards under a specific list owned by the authenticated user
 * @param listId
 * @param session
 * @returns
 */
export const getCards = async (
  listId: string,
  session: TrelloSession,
): Promise<Card[] | null> => {
  return await trelloFetch<TrelloCardsResponse[], Card[]>(
    `lists/${listId}/cards`,
    session,
    (data) =>
      data.map(
        (card) =>
          ({
            id: card.id,
            name: card.name,
            position: card.pos,
            labels: card.labels,
          }) as Card,
      ),
  );
};

/**
 * Move a card to a different list
 */
export const moveCardToList = async (
  cardId: string,
  insertIndex: number,
  listId: string,
  listCards: Card[],
  session: TrelloSession,
): Promise<boolean> => {
  // listCards should already have the card excluded so indices are clean
  const getOrNull = <T>(arr: T[], index: number): T | null =>
    index >= 0 && index < arr.length ? arr[index] : null;

  const prevCard = getOrNull(listCards, insertIndex - 1);
  const nextCard = getOrNull(listCards, insertIndex);

  let newPosition: number;
  if (!prevCard && !nextCard) {
    // Only card in the list
    newPosition = 65536;
  } else if (!prevCard) {
    // Inserting at the top
    newPosition = nextCard!.position / 2;
  } else if (!nextCard) {
    // Inserting at the bottom
    newPosition = prevCard.position + 65536;
  } else {
    // Inserting between two cards
    newPosition = (prevCard.position + nextCard.position) / 2;
  }

  const response = await fetch(`https://api.trello.com/1/cards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idList: listId,
      pos: newPosition,
      key: TRELLO_API_KEY,
      token: session.accessToken,
    }),
  });

  return response.ok;
};

export const addCardToList = async (
  card: Card,
  listId: string,
  session: TrelloSession,
) => {
  const response = await fetch(`https://api.trello.com/1/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idList: listId,
      pos: "top",
      key: TRELLO_API_KEY,
      name: card.name,
      token: session.accessToken,
    }),
  });
  return response.ok;
};

export const updateCardName = async (
  cardId: string,
  name: string,
  session: TrelloSession,
): Promise<boolean> => {
  const response = await fetch(`https://api.trello.com/1/cards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      key: TRELLO_API_KEY,
      token: session.accessToken,
    }),
  });
  return response.ok;
};

export const deleteCard = async (
  cardId: string,
  session: TrelloSession,
): Promise<boolean> => {
  const response = await fetch(`https://api.trello.com/1/cards/${cardId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: TRELLO_API_KEY,
      token: session.accessToken,
    }),
  });
  return response.ok;
};
