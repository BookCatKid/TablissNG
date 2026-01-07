import React, { FC, useEffect, useState } from "react";
import { defaultData, Props } from "./types";

const CustomText: FC<Props> = ({ data = defaultData }) => {
  const [currentText, setCurrentText] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Code for unbiased rand from https://pthree.org/2018/06/13/why-the-multiply-and-floor-rng-method-is-biased
  const unbiasedRand = (range: number) => {
    const max = Math.floor(2 ** 32 / range) * range;
    let x;
    do {
      x = Math.floor(Math.random() * 2 ** 32);
    } while (x >= max);

    return x % range;
  };

  const updateText = () => {
    const sep: string = data.atNewline ? "\n" : data.separator;
    const texts = data.text.split(sep);
    const result = texts[unbiasedRand(texts.length)];
    setCurrentText(result);
    setLastUpdate(Date.now());
  };

  // Initial text update
  useEffect(() => {
    updateText();
  }, [data.text, data.separator, data.atNewline]);

  // Handle timing updates
  useEffect(() => {
    if (data.paused || data.timeout === 0) return;

    const interval = setInterval(() => {
      if (Date.now() - lastUpdate >= data.timeout * 1000) {
        updateText();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data.timeout, data.paused, lastUpdate]);

  return (
    <div className="CustomText">
      <h3>{currentText}</h3>
    </div>
  );
};

export default CustomText;
