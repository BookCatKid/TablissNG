import { useEffect, useState } from "react";
import { Data, Cache, List, FetchJob } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";
import useAuth from "./useAuth";

export default function useLists(data: Data, cache: Cache, setCache: (cache: Cache) => void) {
    const { authStatus } = useAuth();
    const [lists, setLists] = useState<List[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // when a board is selected fetch the lists under it
    useEffect(() => {
        setIsLoading(true);
        const effect = async () => {
            if (!data.selectedID) return;
            console.log("TRELLO: Fetching lists");
            const lists = await getLists(data.selectedID);
            if (!lists) return;
        
            if (data.preferences === undefined || !(data.selectedID in data.preferences)) {
                console.log("TRELLO: no preferences found");
                setLists(lists);
                setIsLoading(false);
                return;
            }

            const preferences = data.preferences[data.selectedID];
            console.log("TRELLO: Attempting to apply preferences");
            let listsWithPreferences = await applyPreferences(lists, preferences);
            setLists(listsWithPreferences);
            setIsLoading(false);

            // load new fetching jobs into cache
            const filtered = listsWithPreferences.filter(list => list.watch);
            const responses = new Map<string, FetchJob>();
            filtered.map(list => {
                responses.set(list.id, { listId: list.id, items: [], loading: true} as FetchJob)
            });

            setCache({
                ...cache,
                order: filtered,
                responses: responses
            });
        };

        if (authStatus === "authenticated") {
            effect();
        }
    }, [data.selectedID, authStatus]);


    /**
     * Update Trello UI with new fetch jobs
     * @param listId 
     * @param jobs 
     * @param action 
     */
    const updateUI = async (listId: string, selectedLists: List[], jobs: Set<FetchJob>, action: "ADD" | "REMOVE") => {
        if (action === "ADD") {
            const updatedFetchJobs = cache.responses;
            jobs.forEach(job => {
                console.log("TRELLO: Adding new fetch job ", job);
                updatedFetchJobs.set(job.listId, job);
            });
            
            // update with new order of display and
            // create new pending fetch operation
            console.log("TRELLO: Updating UI from useLists.ts");
            setCache({
                ...cache, 
                order: selectedLists, 
                responses: updatedFetchJobs,
            });
        } else {                
            // delete the job under the list being removed
            cache.responses.delete(listId);
            setCache({
                ...cache,
                order: selectedLists
            });
        }
    }

    return { lists, setLists, isLoading, updateUI }
}