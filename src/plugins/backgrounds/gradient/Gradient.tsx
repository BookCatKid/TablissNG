import React, { FC, useEffect, useState } from "react";
import { Props, defaultData } from "./types";

interface GradientData {
  name: string;
  colors: string[];
}

const Gradient: FC<Props> = ({ data = defaultData, setData }) => {
  const [randomGradient, setRandomGradient] = useState<GradientData | null>(
    null,
  );

  useEffect(() => {
    if (data.isRandom) {
      fetch(
        "https://raw.githubusercontent.com/ghosh/uiGradients/master/gradients.json",
      )
        .then((response) => response.json())
        .then((gradients: GradientData[]) => {
          const randomIndex = Math.floor(Math.random() * gradients.length);
          const selectedGradient = gradients[randomIndex];
          setRandomGradient(selectedGradient);
          setData({ ...data, currentGradientName: selectedGradient.name });
        })
        .catch((error) => {
          console.error("Failed to fetch random gradient:", error);
          setRandomGradient(null);
          setData({ ...data, currentGradientName: undefined });
        });
    }
  }, [data.isRandom]);

  return (
    <div
      className="Gradient fullscreen"
      style={{
        backgroundImage:
          data.isRandom && randomGradient
            ? `linear-gradient(${data.angle}deg, ${randomGradient.colors.join(", ")})`
            : data.type === "radial-gradient"
              ? `radial-gradient(circle at center, ${data.from}, ${data.to})`
              : `linear-gradient(${data.angle}deg, ${data.from}, ${data.to})`,
      }}
    />
  );
};

export default Gradient;
