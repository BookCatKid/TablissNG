import React, { useEffect, useRef, useState } from "react";

import useAuth from "../../../../hooks/useAuth";
import { CacheReducerAction } from "../reducers";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import { Data, List, TrelloSession } from "../types";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";

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
  const preferencesRef = useRef(data.preferences);
  preferencesRef.current = data.preferences;

  useEffect(() => {
    const fetchLists = async () => {
      if (!data.selectedID) return;
      setIsLoading(true);
      console.log("TRELLO: Fetching lists");
      const session = await getSession();
      if (!session) {
        return;
      }
      let lists = await getLists(data.selectedID, session);
      if (!lists) {
        return;
      }

      if (
        !!preferencesRef.current &&
        data.selectedID in preferencesRef.current
      ) {
        console.log("TRELLO: Attempting to apply preferences");
        const preferences = preferencesRef.current[data.selectedID];
        console.log("TRELLO: preferences ", preferences);
        lists = await applyPreferences(lists, preferences);
        console.log("TRELLO: Applied preferences");
      }

      setLists(lists);
      setIsLoading(false);

      const selectedLists = lists.filter((l) => l.selected);
      const order = selectedLists.map((l) => l.id);
      dispatchUI({
        type: "UPDATE_LISTS",
        order: order,
        lists: selectedLists,
      });
    };

    if (authStatus === "authenticated") {
      fetchLists();
    }
  }, [data.selectedID, authStatus]);

  return { lists, setLists, isLoading };
}
