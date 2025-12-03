import React from "react";
import { DisplayList } from "../../types";
import "./DisplayList.sass";

interface DisplayListComponentProps {
  list: DisplayList;
}

export default function DisplayListComponent({ list }: DisplayListComponentProps) {
  return (
    <div className="display-list">
      <h3 className="display-list-header">{list.name}</h3>
      <div className="display-list-items">
        {list.items.map((item, i) => {
          return (
            <p key={i}>{item.content}</p>
          )
        })} 
      </div>
    </div>
  )
}