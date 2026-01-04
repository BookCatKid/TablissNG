import React, { FC, useEffect, useRef } from "react";
import { Props, List, defaultCache, TrelloSession } from "./types";
import "./Trello.sass";

import DisplayList from "./ui/DisplayList/DisplayList";
import { getItems } from "./utils/api";
import { useTrelloAuthStore } from "./stores/useTrelloAuthStore";
import useAuth from "../../shared/hooks/useAuth";

const Trello: FC<Props> = ({ cache = defaultCache, setCache }) => {
  const { authStatus, getSession } = useAuth<TrelloSession>("trello", useTrelloAuthStore);
  const hasLoadedRef = useRef<boolean>(false);

  // fetch data on load
  useEffect(() => {
    if (hasLoadedRef.current) return;
    const effect = async () => {
      console.log("TRELLO: fetching items for all selected lists");
      const results = await Promise.all(
        Array.from(cache.responses.values()).map(async (response) => {
          if (!response.skeleton) {
            const session = await getSession();
            if (!session) return null;
            const items = await getItems(response.listId, session);
            return items ? { listId: response.listId, response, items } : null;  
          }
        })
      );

      let updatedResponses = cache.responses;
      results.forEach(result => {
        // resolve jobs
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

    if (authStatus === "authenticated") {
      effect();
      hasLoadedRef.current = true;
    }
  }, [authStatus]);

  // fetch data when items in cache are changed
  useEffect(() => {
    const effect = async () => {
      console.log("TRELLO: fetching items for new jobs")
      await Promise.all(
        cache.responses.values().map(async (response) => {
          if (response.loading && !response.skeleton) {
            const session = await getSession();
            if (!session) return null;
            const items = await getItems(response.listId, session);
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
        authStatus !== "authenticated"  ?  
        <p>Sign into Trello to use me</p> : 
        !!cache && cache.order.length === 0 ? 
        <p>Add some lists to view</p> 
        :
        <div className="display-list-container">
          {  
            cache.order.map((list: List) => {
                const response = cache.responses.get(list.id);
                return <DisplayList 
                  header={list.name} 
                  items={response?.items} 
                  loading={response?.loading} 
                />
              }           
            )
          }    
        </div>
      }
    </>
  )
}

export default Trello;
