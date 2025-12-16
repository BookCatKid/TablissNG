import React from "react";
import { DisplayList, TrelloListItem, colourPalette } from "../../types";
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
      return <p key={i}>
      <div style={{width: "2.5rem", height: "0.26rem", background: colourPalette[item.labels[0]?.color]}} />
      {item.name}
      </p>
    })}
  </div>

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {view}
    </div>
  )
}