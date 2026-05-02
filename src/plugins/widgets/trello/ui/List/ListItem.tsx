import { colourPalette, Item } from "../../types";

interface DisplayItemProps {
  item: Item;
}

export default function ListItem({ item }: DisplayItemProps) {
  return (
    <div className="display-list-item-content">
      <div className="labels-container">
        {item.labels.map((label) => (
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
        ))}
      </div>
      <span>{item.name}</span>
    </div>
  );
}
