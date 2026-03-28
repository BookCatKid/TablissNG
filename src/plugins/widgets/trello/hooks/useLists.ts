import { useEffect, useState } from "react";
import {
  Data,
  Cache,
  List,
  UIList,
  createUIList,
  TrelloSession,
} from "../types";
import { getLists } from "../utils/api";
import { applyPreferences } from "../utils/preferences";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import useAuth from "../../../../hooks/useAuth";

export default function useLists(data: Data, setCache: (cache: Cache) => void) {
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

      // load new fetching jobs into cache
      // and update ui
      const filtered = lists.filter((list) => list.watch);
      const _lists = new Map<string, UIList>();
      filtered.map((list) => {
        _lists.set(list.id, { ...createUIList(list.id) });
      });

      setCache({
        order: filtered,
        lists: _lists,
      });
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [data.selectedID, authStatus]);

  return { lists, setLists, isLoading };
}
