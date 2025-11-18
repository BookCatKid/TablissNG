import React, { FC, useEffect, useState, useRef } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List } from "./types";
import "./Trello.sass";

const Trello: FC<Props> = ({data = defaultData, setData}) => {
  const renderDisplayedLists = () => {
    return data.selectedLists.map((list: List) => {
      return { id: list.id, name: list.name, items: [] } as DisplayList
    })
  }

  const ageRef = useRef<number>(Date.now()); 
  const [displayedLists, setDisplayedLists] = useState<DisplayList[]>(renderDisplayedLists());

  useEffect(() => {
    // edit displayed lists when data changes
    setDisplayedLists(renderDisplayedLists());
  }, [data.selectedLists]);

  useEffect(() => {
    const onTabClose = (event: BeforeUnloadEvent) => {
      // check leadership status of tab
    
      // begin bully algorithm
      
    }
  
    return () => {
    }
  }, []);

  return (
    <>
      {displayedLists.map((list: DisplayList) => {
        return (
          <>
            {list.name}
          </>
        )
      })}
    </>
  )
}

export default Trello;
