import React from "react";
import { DisplayList, Item, colourPalette } from "../../types";
import { Spinner } from "../../../../shared";
import "./DisplayList.sass";

interface DisplayListComponentProps {
  header: string;
  items: Item[] | undefined;
  loading: boolean | undefined;
}

export default function DisplayList({
  header,
  items,
  loading,
}: DisplayListComponentProps) {
  const view =
    loading || !items ? (
      <div className="loader-container">
        <Spinner size={24} />
      </div>
    ) : (
      <div className="display-list-items">
        {items.map((item, i) => {
          return (
            <div key={i} className="display-list-item-content">
              <div className="labels-container">
                {item.labels.map((label) => {
                  return (
                    <div
                      key={label.color}
                      style={{
                        width: "2.5rem",
                        height: "0.26rem",
                        borderRadius: "0.5rem",
                        marginBottom: "0.5rem",
                        background: colourPalette[label.color],
                      }}
                    />
                  );
                })}
              </div>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    );

  return (
    <div className="display-list">
      <h3 className="display-list-header">{header}</h3>
      {view}
    </div>
  );
}
