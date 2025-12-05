import { BoardPreference, List } from "../types";

/**
 * Returns a filtered subset of lists with only those selected by the user
 * dicated by their saved preferences 
 * @param lists 
 */
export const applyPreferences = async (lists: List[], preference: BoardPreference) => {
    return lists.map(list => {
        const match = preference.lists.find(item => item.id === list.id);
        return match ? { ...list, watch: match.watch } : list;
    });
}