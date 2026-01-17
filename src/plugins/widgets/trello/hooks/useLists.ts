import { useEffect, useState } from "react";
import { Data, Cache, List, FetchJob, TrelloSession } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";
import { createFetchJob } from "../types";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import useAuth from "../../../../hooks/useAuth";

export default function useLists(
  data: Data,
  cache: Cache,
  setCache: (cache: Cache) => void,
) {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // when a board is selected fetch the lists under it
  useEffect(() => {
    setIsLoading(true);
    const effect = async () => {
      if (!data.selectedID) return;
      console.log("TRELLO: Fetching lists");
      const session = await getSession();
      if (!session) return;
      const lists = await getLists(data.selectedID, session);
      if (!lists) return;

      if (
        data.preferences === undefined ||
        !(data.selectedID in data.preferences)
      ) {
        console.log("TRELLO: no preferences found");
        setLists(lists);
        setIsLoading(false);
        return;
      }

      const preferences = data.preferences[data.selectedID];
      console.log("TRELLO: Attempting to apply preferences");
      const listsWithPreferences = await applyPreferences(lists, preferences);
      setLists(listsWithPreferences);
      console.log("TRELLO: Applied preferences");
      setIsLoading(false);

      // load new fetching jobs into cache
      // and update ui
      const filtered = listsWithPreferences.filter((list) => list.watch);
      const responses = new Map<string, FetchJob>();
      filtered.map((list) => {
        responses.set(list.id, { ...createFetchJob(list.id), skeleton: false });
      });

      setCache({
        order: filtered,
        responses: responses,
      });
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [data.selectedID, authStatus]);

  /**
   * Given a set of pending jobs (represented as skeletons in the ui)
   *
   * @param listId
   * @param jobs
   * @param action
   */
  const updateUI = async (
    listId: string,
    selectedLists: List[],
    skeletonJobs: Set<FetchJob>,
    action: "ADD" | "REMOVE",
  ) => {
    if (action === "ADD") {
      const jobs = new Map(cache.responses);

      // convert any skeletons into actual loading jobs
      skeletonJobs.forEach((job) => {
        console.log("TRELLO: Adding new fetch job ", job);
        jobs.set(job.listId, { ...job, skeleton: false } as FetchJob);
      });

      // update with new order of display and
      // create new pending fetch operation
      console.log("TRELLO: Updating UI from useLists.ts");
      setCache({
        order: selectedLists,
        responses: jobs,
      });
    } else if (action === "REMOVE") {
      console.log("REMOVE");
      // delete the job under the list being removed
      cache.responses.delete(listId);
      setCache({
        ...cache,
        order: selectedLists,
      });
    }
  };

  /**
   * Used for optimistic UI updates
   * Populate UI with skeleton loader components
   * @param lists
   * @param jobs
   */
  const updateUIWithSkeletons = async (lists: List[], jobs: Set<FetchJob>) => {
    const updatedSkeletons = new Map(cache.responses);
    jobs.forEach((job) => {
      updatedSkeletons.set(job.listId, job);
    });

    setCache({
      ...cache,
      order: lists,
      responses: updatedSkeletons,
    });
  };

  return { lists, setLists, isLoading, updateUI, updateUIWithSkeletons };
}
