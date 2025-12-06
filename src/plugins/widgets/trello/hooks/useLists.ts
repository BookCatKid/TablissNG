import { useEffect, useState } from "react";
import { AuthState, Data, Cache, List, TrelloItemsResponse, BoardPreference } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";

export default function useLists(data: Data, cache: Cache, setCache: (cache: Cache) => void, authState: AuthState) {
    const [lists, setLists] = useState<List[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // when a board is selected fetch the lists under it
    useEffect(() => {
        setIsLoading(true);
        const effect = async () => {
            if (!data.selectedID) return;
            const lists = await getLists(data.selectedID);
            if (!lists) return;

            // load preferences
            if (!data.preferences.hasOwnProperty(data.selectedID)) {
                setLists(lists);
                setIsLoading(false);
                return;
            }

            const preferences = data.preferences[data.selectedID];

            let listsWithPreferences = await applyPreferences(lists, preferences);
            setLists(listsWithPreferences);
            setIsLoading(false);

            // load new fetching jobs into cache
            const filtered = listsWithPreferences.filter(list => list.watch);
            const responses = new Map<string, TrelloItemsResponse>();
            filtered.map(list => {
                responses.set(list.id, { listId: list.id, items: [], loading: true} as TrelloItemsResponse)
            });

            setCache({
                ...cache,
                order: filtered,
                responses: responses
            });
        };

        if (authState === "authenticated") {
            effect();
        }
    }, [data.selectedID, authState]);

    const updateUI = async (listId: string, selections: List[], action: "ADD" | "REMOVE") => {
        // update UI
        if (action === "ADD") {
            // update with new order of display and
            // create new pending fetch operation
            console.log("UPDATING UI");
            setCache({
                ...cache, 
                order: selections, 
                responses: cache.responses.set(listId, { 
                    listId: listId, 
                    items: [], 
                    loading: true } as TrelloItemsResponse
                )
            });
        } else {
        cache.responses.delete(listId);
        setCache({
            ...cache,
            order: selections
        });
        }
    }

    return { lists, setLists, isLoading, updateUI }
}