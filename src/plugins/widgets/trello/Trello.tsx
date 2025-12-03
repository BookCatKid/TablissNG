import React, { FC, useEffect, useState, useRef } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List } from "./types";
import { getItems } from "./api";
import DisplayListComponent from "./ui/DisplayListComponent/DisplayListComponent";
import "./Trello.sass";

const Trello: FC<Props> = ({data = defaultData, setData}) => {
  const renderDisplayedLists = () => {
    return data.selectedLists.map((list: List) => {
      return { id: list.id, name: list.name, items: [], loading: true } as DisplayList
    })
  }
  const [displayedLists, setDisplayedLists] = useState<DisplayList[]>(renderDisplayedLists());
  const displayedListsRef = useRef(displayedLists);

  useEffect(() => {
    setDisplayedLists(renderDisplayedLists());
  }, [data.selectedLists]);

  useEffect(() => {
    // fetch data when a new list is added

  }, []);

  useEffect(() => {
    displayedListsRef.current = displayedLists;
  }, [displayedLists])

  useEffect(() => {
    // on page load update all displayed lists with new data 
    const effect = async () => {
      const updated: DisplayList[] = await Promise.all(
      displayedListsRef.current.map(async (list) => {
        const items = await getItems(list.id);
        
        if (!items) {
          console.error("Could not fetch items");
          return { ...list, items: list.items }; // keep existing items on error
        }
        
        return { 
          ...list, 
          loading: false,
          items: items.map(item => ({ content: item.name } as DisplayListItem)) 
        };
      }));

      console.log(updated);
      setDisplayedLists(updated);
    }

    if (data.authState === "authenticated") {
      effect();
    }
  }, [data.authState])

  return (
    <>
      {
        displayedLists.length === 0 ? <p>Add some lists to view</p>  
      :
        <div className="display-list-container">
        {  
          displayedLists.map((list: DisplayList) => {
            return <DisplayListComponent list={list} />
          }
        )}    
        </div>
      }
    </>
  )
}

export default Trello;
