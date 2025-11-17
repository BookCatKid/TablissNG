import React, { FC, useEffect, useState } from "react";
import { defaultData, Props, DisplayList, DisplayListItem, List } from "./types";
import "./Trello.sass";

const Trello: FC<Props> = ({data = defaultData, setData}) => {
  const [displayedLists, setDisplayedLists] = useState<DisplayList[]>(
    data.selectedLists.map((list: List) => { 
      return {id: list.id, name: list.name, items: []} as DisplayList 
    })
  );

  useEffect(() => {
    console.log(data.selectedLists);
    setDisplayedLists(data.selectedLists.map((list: List) => { 
      return {id: list.id, name: list.name, items: []} as DisplayList 
    }));
  }, [data.selectedLists]);

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