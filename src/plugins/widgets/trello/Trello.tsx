import React, { FC, useEffect } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List } from "./types";
import { getItems } from "./api";
import DisplayListComponent from "./ui/DisplayListComponent/DisplayListComponent";
import "./Trello.sass";
import Skeleton from "./ui/Skeleton/Skeleton";

const Trello: FC<Props> = ({ data = defaultData, cache, setCache, loader }) => {
  const renderDisplayedLists = () => {
    return data.selectedLists.map((list: List) => {
      return { id: list.id, name: list.name, items: [], loading: true } as DisplayList
    })
  }

  useEffect(() => {
    // on page load update all displayed lists with new data 
    const effect = async () => {
      loader.push();
      const updated: DisplayList[] = await Promise.all(
      data.selectedLists.map(async (list, i) => {
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
      }));

      console.log(updated);
      setCache({...cache, displayedLists: updated});
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
        (data.authState !== "authenticated" || data.selectedLists.length === 0) ? <p>Add some lists to view</p>  
      :
        <div className="display-list-container">
        {  
          // // if cache is empty display skeleton
          // !cache || !cache.displayedLists ? 
          //   data.selectedLists.map(list => {
          //     console.log("Ccreating skeelton");
          //     return <Skeleton header={list.name} />
          //   })
          //   : 
          //   cache.displayedLists.map((list: DisplayList) => {
          //     return <DisplayListComponent list={list} />
          //   }
        //   )
          data.selectedLists.map(list => {
            return <Skeleton header={list.name} />
          })
        }    
        </div>
      }
    </>
  )
}

export default Trello;
