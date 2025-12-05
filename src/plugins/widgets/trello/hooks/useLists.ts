import { useEffect, useState } from "react";
import { AuthState, Data, Cache, List, TrelloItemsResponse } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences, getPreferences } from "../utils/preferences";

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

    return { lists, setLists, isLoading }
}