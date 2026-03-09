import React, { FC, useState, useMemo } from "react";
import { useCachedEffect } from "../../../hooks";
import { getRandomColorPalette } from "./api";
import { Props, defaultData } from "./types";
import Color from "./Color";
import "./Palette.sass";

const Palette: FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  const [fetching, setFetching] = useState(data.refreshInterval === 0);

  const expires = useMemo(
    () =>
      data.refreshInterval === 0
        ? 0
        : cache
          ? cache.timestamp + data.refreshInterval * 1000
          : 0,
    [cache?.timestamp, data.refreshInterval],
  );

  useCachedEffect(
    () => {
      setFetching(true);
      getRandomColorPalette(loader).then((newCache) => {
        setCache(newCache);
        setFetching(false);
      });
    },
    expires,
    [],
  );

  if (fetching || cache?.isLoading || !cache?.palette) {
    return (
      <div className="Palette is-loading">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="Color" />
        ))}
      </div>
    );
  }

  return (
    <div className="Palette">
      {cache.palette.map((color, index) => (
        <Color
          key={index}
          displayColor={color}
          format={data.colorFormat.replace("_hidden", "") as "hex" | "rgb"}
          showLabel={!data.colorFormat.endsWith("_hidden")}
        />
      ))}
    </div>
  );
};

export default Palette;
