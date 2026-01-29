import React from "react";
import { useBackgroundRotation } from "../../../hooks";
import BaseBackground from "../base/BaseBackground";
import { getGifs } from "./api";
import giphyLogo from "./giphy-logo.png";
import { defaultData, Props } from "./types";

const Giphy: React.FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  setData,
  loader,
}) => {
  const { item, go, handlePause } = useBackgroundRotation({
    fetch: () => getGifs(data, loader),
    cacheObj: { cache, setCache },
    data,
    setData,
    loader,
    deps: [data.by, data.tag, data.nsfw],
  });

  const url = item?.url || null;

  if (!item || !url) return null;

  const leftInfo = [
    {
      label: (
        <img src={giphyLogo} alt="Powered by GIPHY" width={101} height={36} />
      ),
      url: item.link || "https://giphy.com/",
    },
  ];

  return (
    <BaseBackground
      containerClassName="Giphy fullscreen"
      url={url}
      paused={data.paused ?? false}
      onPause={handlePause}
      onPrev={go(-1)}
      onNext={go(1)}
      showInfo={true}
      leftInfo={leftInfo}
    />
  );
};

export default Giphy;
