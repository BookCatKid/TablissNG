import { type FC } from "react";

import { useBackgroundRotation } from "../../../hooks";
import BaseBackground from "../base/BaseBackground";
import { fetchImages } from "./api";
import { defaultData, Image as OnlineImage, Props } from "./types";

const Online: FC<Props> = ({
  cache,
  data: savedData,
  loader,
  setCache,
  setData,
}) => {
  const data = { ...defaultData, ...savedData };
  const isJson = data.responseType === "json";

  const { item, go, handlePause } = useBackgroundRotation({
    fetch: () => (isJson ? fetchImages(data, loader) : Promise.resolve([])),
    cacheObj: { cache, setCache },
    data,
    setData,
    loader,
    deps: [data.responseType, data.url, data.jsonPath],
    buildUrl: (image: OnlineImage) => image.url,
  });

  const url = isJson ? item?.url || null : data.url || null;

  return (
    <BaseBackground
      containerClassName="Online fullscreen"
      url={url}
      paused={data.paused}
      onPause={handlePause}
      onPrev={isJson ? go(-1) : null}
      onNext={isJson ? go(1) : null}
      showControls={isJson}
      controlsOnHover={!data.showControls}
      showInfo={false}
    />
  );
};

export default Online;
