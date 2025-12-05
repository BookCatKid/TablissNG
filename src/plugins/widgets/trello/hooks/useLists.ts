import { useEffect, useState } from "react";
import { AuthState, Data, Cache, List, TrelloItemsResponse, BoardPreferences } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences, getPreferences, setPreferences } from "../utils/preferences";

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

            const preferences = await getPreferences(data.selectedID);
            console.log("PREFERENCES ", preferences);

            let listsWithPreferences = lists;
            if (preferences) {
                listsWithPreferences = await applyPreferences(lists, preferences);
            }
            
            setLists(listsWithPreferences);
            setIsLoading(false);

            // load new fetching jobs into cache
            const filtered = listsWithPreferences.filter(list => list.watch);
            const responses = new Map<string, TrelloItemsResponse>();
            filtered.map(list => {
                console.log(list.name);
                responses.set(list.id, { listId: list.id, items: [], loading: true} as TrelloItemsResponse)
            });

            console.log("Filtered ", filtered);
            setCache({
                ...cache,
                order: filtered,
                responses: responses
            })
        };

        if (authState === "authenticated") {
        effect();
        }
    }, [data.selectedID, authState]);

    const updatePreferencesAndUI = async (listId: string, selections: List[], action: "ADD" | "REMOVE") => {
        const filtered = selections.filter((list: List ) => { return list.watch });
        const newPreferences: BoardPreferences = {selectedLists: filtered };
        setPreferences(data.selectedID, newPreferences); 

        // update UI
        if (action === "ADD") {
            // update with new order of display and
            // create new pending fetch operation
            setCache({
                ...cache, 
                order: filtered, 
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
            order: filtered
        });
        }
    }

    return { lists, setLists, isLoading, updatePreferencesAndUI }
}