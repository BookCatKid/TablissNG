import { BoardPreferences, List } from "../types";

export const setPreferences = async (boardID: string | null, preferences: BoardPreferences) => {
    if (!boardID) {
        throw new Error("Received NULL boardID");
    }

    console.log("Setting preference");
    await browser.storage.local.set({ [boardID]: preferences });
}

export const getPreferences = async (boardID: string | null) => {
    if (!boardID) {
        throw new Error("Received NULL boardID");
    }

    console.log("Getting preference for board ", boardID);
    const obj = await browser.storage.local.get(boardID);
    return obj[boardID] as BoardPreferences;
}

/**
 * Returns a filtered subset of lists with only those selected by the user
 * dicated by their saved preferences 
 * @param lists 
 */
export const applyPreferences = async (lists: List[], preferences: BoardPreferences) => {
    return lists.map(list => {
        const match = preferences.selectedLists.find(item => item.id === list.id);
        return match ? { ...list, watch: match.watch } : list;
    });
}