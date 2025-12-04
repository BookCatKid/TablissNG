import React, { FC, useEffect, useState } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List } from "./types";
import { getItems } from "./api";
import DisplayListComponent from "./ui/DisplayListComponent/DisplayListComponent";
import "./Trello.sass";
import Skeleton from "./ui/Skeleton/Skeleton";
import { getPreferences } from "./utils/preferences";

const Trello: FC<Props> = ({ data = defaultData, cache, setCache, loader }) => {
  const updateDisplayedLists = async (lists: List[]) => {
    const updated: DisplayList[] = await Promise.all(
      lists.map(async (list, i) => {
        const items = await getItems(list.id);
        if (!items) {
          console.error("Could not fetch items");
          return { 
            id: list.id, 
            name: list.name, 
            loading: false,
            items: cache ? cache.displayedLists[i].items : [] } as DisplayList
        }
        
        return { 
          id: list.id,
          name: list.name,
          loading: false,
          items: items.map(item => ({ content: item.name } as DisplayListItem)) 
        } as DisplayList;
      }) 
    )
    setCache({...cache, displayedLists: updated});
  }

  return (
    <>
      {
        data.authState !== "authenticated"  ? 
          <p>Sign into Trello to use</p> : 
        !cache || cache.displayedLists.length === 0 ? 
          <p>Add some lists to view</p>  
      :
        <div className="display-list-container">
        {  
          // if cache is empty display skeleton
          !cache || !cache.displayedLists ? 
            data.selectedLists.map(list => {
              return <Skeleton header={list.name} />
            })
          : 
            cache.displayedLists.map((list: DisplayList) => {
              return <DisplayListComponent list={list} />
            })
        }    
        </div>
      }
    </>
  )
}

export default Trello;
