import { BoardPreferences } from "../types";

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