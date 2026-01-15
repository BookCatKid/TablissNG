import { useEffect, useState } from "react";
import { Board, Data, TrelloSession } from "../types";
import { getBoards } from "../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { useTrelloAuthStore } from "../stores/useTrelloAuthStore";

export default function useBoards(data: Data, setData: (data: Data) => void) {
  const { authStatus, getSession } = useAuth<TrelloSession>(
    "trello",
    useTrelloAuthStore,
  );
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const effect = async () => {
      console.log("TRELLO: Fetching boards");
      const session = await getSession();
      if (!session) return;
      const boards = await getBoards(session);
      if (!boards) return; // add better error handling
      setBoards(boards);

      // if the user has not yet selected a board
      // set a default for them using the first board
      if (!data.selectedID) {
        setData({ ...data, selectedID: boards[0].id });
      }

      setIsLoading(false);
    };

    if (authStatus === "authenticated") {
      effect();
    }
  }, [authStatus]);

  return { boards, isLoading };
}
