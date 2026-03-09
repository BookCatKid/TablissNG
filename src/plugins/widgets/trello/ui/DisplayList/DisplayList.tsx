import React, { useRef } from "react";
import { DisplayList, Item, colourPalette } from "../../types";
import { Spinner } from "../../../../shared";
import "./DisplayList.sass";
import Moveable from "react-moveable";

type ListItems = Record<string, HTMLDivElement>;

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
  const listItemRefs = useRef<ListItems>({});
  const view =
    loading || !items ? (
      <div className="loader-container">
        <Spinner size={24} />
      </div>
    ) : (
      <div className="display-list-items">
        {items.map((item) => {
          return (
            <div
              key={item.name}
              className="display-list-item-content"
              ref={(element) => {
                listItemRefs.current[item.name] = element!;
              }}
            >
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
