import "./style.sass";

import { Card as CardType,colourPalette } from "../../../types";

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  return (
    <div className="card-content-container">
      <div className="labels-container">
        {card.labels.map((label) => (
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
      <span>{card.name}</span>
    </div>
  );
}
