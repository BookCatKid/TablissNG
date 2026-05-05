import React, { useEffect, useRef, useState } from "react";

import useAuth from "../../../../hooks/useAuth";
import { CacheReducerAction } from "../cacheReducer";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import { createListItems, Data, List, TrelloSession } from "../types";
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
    const effect = async () => {
      if (!data.selectedID) return;
      setIsLoading(true);
      console.log("TRELLO: Fetching lists");
      const session = await getSession();
      if (!session) return;
      let lists = await getLists(data.selectedID, session);
      if (!lists) return;

      if (
        !!preferencesRef.current &&
        data.selectedID in preferencesRef.current
      ) {
        console.log("TRELLO: Attempting to apply preferences");
        const preferences = preferencesRef.current[data.selectedID];
        lists = await applyPreferences(lists, preferences);
        console.log("TRELLO: Applied preferences");
      }

      setLists(lists);
      setIsLoading(false);

      const selectedLists = lists.filter((l) => l.selected);
      const ListItemss = selectedLists.map((l) => createListItems(l.id));
      dispatchUI({ type: "UPDATE", order: selectedLists, lists: ListItemss });
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [data.selectedID, authStatus, dispatchUI, getSession]);

  return { lists, setLists, isLoading };
}
