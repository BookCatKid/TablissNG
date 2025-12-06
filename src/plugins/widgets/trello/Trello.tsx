import React, { FC, useEffect, useRef } from "react";
import { Props, List, defaultCache } from "./types";
import "./Trello.sass";
import useAuth from "./hooks/useAuth";
import DisplayList from "./ui/DisplayList/DisplayList";
import { getItems } from "./utils/api";

const Trello: FC<Props> = ({ cache = defaultCache, setCache }) => {
  console.log(cache);
  const { authState } = useAuth(cache, setCache);
  const hasLoadedRef = useRef<boolean>(false);

  // fetch data on load
  useEffect(() => {
    if (hasLoadedRef.current) return;
    const effect = async () => {
      console.log("FETCHIN DATA ON LOAD");
      const results = await Promise.all(
        Array.from(cache.responses.values()).map(async (response) => {
          console.log("Fetching items for ", response.listId);
          const items = await getItems(response.listId);
          return items ? { listId: response.listId, response, items } : null;
        })
      );

      let updatedResponses = cache.responses;
      results.forEach(result => {
        if (result) {
          updatedResponses = updatedResponses.set(result.listId, {
            ...result.response,
            loading: false,
            items: result.items
          });
        }
      });

      setCache({
        ...cache,
        responses: updatedResponses
      });
    };

    if (!!authState && authState === "authenticated") {
      effect();
      hasLoadedRef.current = true;
    }
  }, [authState, cache.responses]);

  // refetch data when items in cache are changed
  useEffect(() => {
    const effect = async () => {
      await Promise.all(
        cache.responses.values().map(async (response) => {
          if (response.loading) {
            const items = await getItems(response.listId);
            if (items) {
              setCache({
                ...cache,
                responses: cache.responses.set(response.listId, { ...response, loading: false, items: items })
              });
            }
          }
        })
      )
    }   
    effect();
  }, [cache.order]);

  return (
    <>
      {
        authState !== "authenticated"  ?  
        <p>Sign into Trello to use me</p> : 
        !!cache && cache.order.length === 0 ? 
        <p>Add some lists to view</p> 
        :
        <div className="display-list-container">
        {  
          cache.order.map((list: List) => {
            const response = cache.responses.get(list.id);
            return <DisplayList header={list.name} items={response?.items} loading={response?.loading} />
          }           
          )
        }    
        </div>
      }
    </>
  )
}

export default Trello;
