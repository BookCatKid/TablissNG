import { useContext } from "react";

import { UiContext } from "../contexts/ui";
import { cache as cacheDb, db } from "../db/state";
import { useKey, useValue } from "../lib/db/react";
import { API } from "../plugins";

// TODO: consider alternative ways to supply api that isn't eager loading
//       the entire object for every plugin
export function useApi(id: string): API {
  // Scope cache entries per profile to prevent bleed across profiles
  const activeProfileId = useValue(db, "activeProfileId");
  const cacheKey = activeProfileId ? `${activeProfileId}/${id}` : id;

  // Cache
  const [cache, setCache] = useKey(cacheDb, cacheKey);

  // Data
  const [data, setData] = useKey(db, `data/${id}`);

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
