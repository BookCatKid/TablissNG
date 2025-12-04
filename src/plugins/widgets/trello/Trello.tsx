import React, { FC, useEffect, useRef, useState } from "react";
import { defaultData, Props, List, defaultCache, TrelloItemsResponse } from "./types";
import { getItems } from "./api";
import DisplayList from "./ui/DisplayList/DisplayList";
import "./Trello.sass";
import { getPreferences } from "./utils/preferences";

const Trello: FC<Props> = ({ data = defaultData, cache = defaultCache, setCache }) => {
  const hasLoadedRef = useRef<boolean>(false);

  // fetch data on load
  useEffect(() => {
    if (hasLoadedRef.current) return;

    const effect = async () => {
      await Promise.all(
        cache.responses.values().map(async (response) => {
          const items = await getItems(response.listId);
          if (items) {
            console.log(items);
            setCache({
              ...cache,
              responses: cache.responses.set(response.listId, { ...response, loading: false, items: items })
            });
          }
        })
      )
    }

    if (data.authState === "authenticated") {
      effect();
      hasLoadedRef.current = true;
    }
  }, [data.authState, cache])

  return (
    <>
      {
        data.authState !== "authenticated"  ?  
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
