import { useContext, useMemo } from "react";

import { UiContext } from "../contexts/ui";
import { cache as cacheDb, db } from "../db/state";
import { useKey } from "../lib/db/react";
import { API } from "../plugins";

// TODO: consider alternative ways to supply api that isn't eager loading
//       the entire object for every plugin
export function useApi(id: string, defaultData: unknown): API {
  // Cache
  const [cache, setCache] = useKey(cacheDb, id);

  // Data
  const [storedData, setData] = useKey(db, `data/${id}`);
  // Merge stored over defaults so newly-added fields fall back to their defaults instead of becoming `undefined`.
  const data = useMemo(
    () =>
      Object.freeze({
        ...(defaultData as object),
        ...(storedData as object),
      }),
    [defaultData, storedData],
  );

  // Loader
  const { pushLoader, popLoader } = useContext(UiContext);
  const loader = { push: pushLoader, pop: popLoader };

  return {
    cache,
    data,
    loader,
    setCache,
    setData,
  };
}
