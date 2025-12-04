import React from "react";
import { DisplayList, TrelloItemsResponse, TrelloListItem } from "../../types";
import Spinner from "../Spinner/Spinner";
import "./DisplayList.sass";

interface DisplayListComponentProps {
  header: string;
  items: TrelloListItem[] | undefined;
  loading: boolean | undefined;
}

export default function DisplayList({ header, items, loading  }: DisplayListComponentProps) {
  const view = loading || !items ? 
  <div className="loader-container">
     <Spinner size={24}/>
  </div> : 
  <div className="display-list-items">
    {items.map((item, i) => {
      return <p key={i}>{item.name}</p>
    })}
  </div>

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {view}
    </div>
  )
}