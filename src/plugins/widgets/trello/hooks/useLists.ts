import React, { useEffect, useState } from "react";
import { Data, List, TrelloSession, createUIList } from "../types";
import { CacheReducerAction } from "../cacheReducer";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import useAuth from "../../../../hooks/useAuth";

export default function useLists(
  data: Data,
  dispatchUI: React.Dispatch<CacheReducerAction>,
) {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // when a board is selected fetch the lists under it
  // and load them into the UI
  useEffect(() => {
    const effect = async () => {
      if (!data.selectedID) return;
      setIsLoading(true);
      console.log("TRELLO: Fetching lists");
      const session = await getSession();
      if (!session) return;
      let lists = await getLists(data.selectedID, session);
      if (!lists) return;

      // Attempt to apply preferences if they exist
      if (!!data.preferences && data.selectedID in data.preferences) {
        console.log("TRELLO: Attempting to apply preferences");
        const preferences = data.preferences[data.selectedID];
        lists = await applyPreferences(lists, preferences);
        console.log("TRELLO: Applied preferences");
      }

      setLists(lists);
      setIsLoading(false);

      const selectedLists = lists.filter((l) => l.selected);
      const uiLists = selectedLists.map((l) => createUIList(l.id));
      dispatchUI({ type: "UPDATE", order: selectedLists, lists: uiLists });
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [data.selectedID, authStatus]);

  return { lists, setLists, isLoading };
}
