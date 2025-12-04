import { Board, Item, List } from "./types";
import { getToken } from "./utils/auth";

export const getBoards = async () => {
    const token = await getToken();
    if (!token) {
        return null;
    }

   const fetchBoardRes = await fetch("https://api-rrswz5h5iq-de.a.run.app/v1/me/boards", { 
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });

    if (!fetchBoardRes.ok) {
        return null;
    }

    const boards = (await fetchBoardRes.json()).boards;
    return boards as Board[];
}

export const getLists = async (boardID: string) => {
    const token = await getToken();
    if (!token) {
        return null;
    }

    const fetchListRes = await fetch(`https://api-rrswz5h5iq-de.a.run.app/v1/me/boards/${boardID}/lists`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
    });

    if (!fetchListRes.ok) {
        return null;
    }

    const lists = (await fetchListRes.json()).lists;
    return lists as List[];
}

/**
 * Load lists under a board and preselect 
 * @param boardID 
 */
export const getListsWithPreferences = async (boardID: string) => {

}

export const getItems = async (listID: string) => {
    const token = await getToken();
    if (!token) {
        return null;
    }

    const fetchItemsRes = await fetch(`https://api-rrswz5h5iq-de.a.run.app/v1/me/lists/${listID}/items`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });

    if (!fetchItemsRes.ok) {
        return null;
    }

    const items = await fetchItemsRes.json();
    return items as Item[];
}