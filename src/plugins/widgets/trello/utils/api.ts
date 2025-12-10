import { Board, Item, List, TrelloBoardResponse, TrelloItemsResponse, TrelloListItem, TrelloListResponse } from "../types";
import { getUserFromJWT, getToken } from "./auth";

export const getBoards = async () => {
    const user = await getUserFromJWT();

    if (!user) {
        return null;
    }

   const fetchBoardRes = await fetch(`https://api.trello.com/1/members/${user.userId}/boards?key=${TRELLO_API_KEY}&token=${user.accessToken}`);

    if (!fetchBoardRes.ok) {
        return null;
    }

    const boardData: TrelloBoardResponse[] = await fetchBoardRes.json();
    const boards: Board[] = boardData.map((data: TrelloBoardResponse) => ({ id: data.id, name: data.name } as Board));
    return boards;
}

export const getLists = async (boardId: string) => {
    const user = await getUserFromJWT();

    if (!user) {
        return null;
    }

    const fetchListRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${user.accessToken}`)

    if (!fetchListRes.ok) {
        return null;
    }

    const listData: TrelloListResponse[] = await fetchListRes.json();
    const lists: List[] = listData.map((data: TrelloListResponse) => ({ id: data.id, name: data.name, boardID: boardId, watch: false } as List));
    console.log(lists);
    return lists;
}

export const getItems = async (listId: string) => {
    const user = await getUserFromJWT();

    if (!user) {
        return null;
    }
    const fetchItemsRes = await fetch(`https://api.trello.com/1/lists/${listId}/cards?key=${TRELLO_API_KEY}&token=${user.accessToken}`);

    if (!fetchItemsRes.ok) {
        return null;
    }

    const data: TrelloItemsResponse = await fetchItemsRes.json();
    const items = data.map((item: TrelloListItem) => ({ id: item.id, name: item.name} as Item));
    return items;
}