import React from "react";
import { buildLink, fetchImages } from "./api";
import { defaultData, Image as UnsplashImage, Props } from "./types";
import { useBackgroundRotation } from "../../../hooks";
import BaseBackground from "../base/BaseBackground";

const Unsplash: React.FC<Props> = ({
  cache,
  data = defaultData,
  loader,
  setCache,
  setData,
}) => {
  // If legacy cache design, clear and let the new cache take over
  // Unfortunately, without the image src being stored, I cannot migrate the old cache
  if (cache && "now" in cache) {
    cache = undefined;
  }

  // Migrate old pause setting
  React.useEffect(() => {
    if (data.timeout === Number.MAX_SAFE_INTEGER) {
      setData({
        ...data,
        paused: true,
        timeout: defaultData.timeout,
      });
    }
  }, []);

  const { item, go, handlePause } = useBackgroundRotation({
    fetch: () => {
      loader.push();
      return fetchImages(data).finally(loader.pop);
    },
    cacheObj: { cache, setCache },
    data,
    setData,
    loader,
    deps: [
      data.by,
      data.collections,
      data.featured,
      data.search,
      (Array.isArray(data.topics) ? data.topics : [data.topics]).join(","),
    ],
    buildUrl: (i: UnsplashImage) => buildLink(i.src),
  });

  const url = item ? buildLink(item.src) : null;

  return (
    <BaseBackground
      containerClassName="Unsplash fullscreen"
      url={url}
      ready={url !== null}
      credit={item ? item.credit : null}
      locationSource={data.locationSource}
      paused={data.paused ?? false}
      onPause={handlePause}
      onPrev={go(-1)}
      onNext={go(1)}
    />
  );
};

export default Unsplash;
