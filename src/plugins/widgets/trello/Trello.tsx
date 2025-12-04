import React, { FC, useEffect, useState } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List, defaultCache, TrelloItemsResponse } from "./types";
import { getItems } from "./api";
import DisplayListComponent from "./ui/DisplayListComponent/DisplayListComponent";
import "./Trello.sass";
import Skeleton from "./ui/Skeleton/Skeleton";
import { getPreferences } from "./utils/preferences";

const Trello: FC<Props> = ({ data = defaultData, cache = defaultCache, setCache, loader }) => {
  // refetch data on newly added lists
  useEffect(() => {
    const effect = async () => {
      await Promise.all(
        cache.responses.values().map(async (response, listId) => {
            // refetch data on any responses marked as loading
            if (response.loading) {
              const items = await getItems(response.listId);
              if (items) {
                response.items = items;
              }
            }
            console.log("Fetched data ",  response);
        })
      )
    }

    if (data.authState === "authenticated") {
      effect();
    }
  }, [cache.order, data.authState])


  return (
    <>
      {
        data.authState !== "authenticated"  ? 
          <p>Sign into Trello to use</p> : 
        !cache || cache.order.length === 0 ? 
          <p>Add some lists to view</p>  
      :
        <div className="display-list-container">
        {  
          cache.order.map((list: List) => (
           <p>{list.name}</p>
          ))
        }    
        </div>
      }
    </>
  )
}

export default Trello;
