import { FC, useEffect, useState } from "react";

import { defaultData, Props } from "./types";
import { sanitizeRichText } from "../../../utils/richText";

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

  const getEntries = () => {
    if (data.richTextEnabled && data.strings && data.strings.length > 0) {
      return data.strings;
    }
    const sep: string = data.atNewline ? "\n" : data.separator || "\n";
    return data.text ? data.text.split(sep) : [""];
  };

  const updateText = () => {
    const texts = getEntries();
    const cleanedList = texts.filter((entry) => entry !== undefined && entry !== null);
    if (cleanedList.length === 0) {
      setCurrentText("");
      return;
    }
    const result = cleanedList[unbiasedRand(cleanedList.length)];
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

  const useRich = Boolean(data.richTextEnabled);

  return (
    <div className="CustomText">
      {useRich ? (
        <div
          className="custom-text-rich"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(currentText) }}
        />
      ) : (
        <h3>{currentText}</h3>
      )}
    </div>
  );
};

export default CustomText;
