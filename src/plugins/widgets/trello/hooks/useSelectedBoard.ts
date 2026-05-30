import { useEffect, useState } from "react";

import { Data } from "../types";
export function useSelectedBoard(data: Data) {
  const [boardId, setBoardId] = useState<string | null>(data.selectedID);

  useEffect(() => {
    setBoardId(data.selectedID);
  }, [data.selectedID]);
  return { boardId };
}
