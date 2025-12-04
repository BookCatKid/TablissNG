import React, { FC, useEffect } from "react";
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

  useEffect(() => {
    const effect = async () => {
      console.log("LOADING PREFS INTO UI")
      if (!!data.selectedID) {
        const preferences = await getPreferences(data.selectedID);
        loader.push();
        await updateDisplayedLists(preferences.selectedLists);
        loader.pop();
      }
    }
    effect();
  }, [data.selectedID]);

  useEffect(() => {
    // on page load update all displayed lists with new data 
    const effect = async () => {
      loader.push();
      await updateDisplayedLists(data.selectedLists);
      loader.pop();
    }

    if (data.authState === "authenticated") {
      effect();
    }
  }, [data.selectedLists, data.authState])

  console.log("Cache ", cache);
  console.log("Cache lists ", cache?.displayedLists);
  console.log("Data lists ", data.selectedLists);
  console.log("Data id", data.selectedID);
  return (
    <>
      {
        (data.authState !== "authenticated" || cache?.displayedLists.length === 0) ? <p>Add some lists to view</p>  
      :
        <div className="display-list-container">
        {  
          // if cache is empty display skeleton
          !cache || !cache.displayedLists ? 
            data.selectedLists.map(list => {
              console.log("Creating skeelton");
              return <Skeleton header={list.name} />
            })
          : 
            cache.displayedLists.map((list: DisplayList) => {
              console.log("Generating display list");
              console.log(list);
              return <DisplayListComponent list={list} />
            })
        }    
        </div>
      }
    </>
  )
}

export default Trello;
