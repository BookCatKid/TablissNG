import React from "react";
import { DisplayList } from "../../types";
import Spinner from "../Spinner/Spinner";
import "./DisplayList.sass";

interface DisplayListComponentProps {
  list: DisplayList;
}

export default function DisplayListComponent({ list }: DisplayListComponentProps) {
  const view = list.loading ? 
  <div className="loader-container">
     <Spinner size={24}/>
  </div> : 
  <div className="display-list-items">
    {list.items.map((item, i) => {
      return <p key={i}>{item.content}</p>
    })}
  </div>

  return (
    <div className="display-list">
      <h3 className="display-list-header">{list.name}</h3>
      {view}
    </div>
  )
}