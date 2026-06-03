import { useEffect, useState } from "react";

import useAuth from "../../../../hooks/useAuth";
import { trelloAuthStore } from "../stores/trelloAuthStore";
import { Label, TrelloSession } from "../types";
import { getLabels } from "../utils/api";

export function useLabelsOnBoard(boardId: string) {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    trelloAuthStore,
  );

  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const effect = async () => {
      console.log("TRELLO: Fetching labels");
      const session = await getSession();
      if (!session) return;
      const labels = await getLabels(boardId, session);
      if (!labels) return;
      setLabels(labels);
      setIsLoading(false);
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [authStatus, boardId]);

  return { labels, isLoading };
}
