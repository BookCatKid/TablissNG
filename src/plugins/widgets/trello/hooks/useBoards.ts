import { useEffect, useState } from "react";
import { AuthState, Board, Data } from "../types";
import { getBoards } from "../utils/api";

export default function useBoards(data: Data, setData: (data: Data) => void, authState: AuthState) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const effect = async () => {
            const boards = await getBoards();
            if (!boards) return; // add better error handling
            setBoards(boards);

            // if the user has not yet selected a board
            // set a default for them using the first board
            if (!data.selectedID) {
                setData({...data, selectedID: boards[0].id});
            }

            setIsLoading(false);
        };

        if (authState === "authenticated") {
            effect();
        }
    }, [authState]);

    return { boards, isLoading  }
}