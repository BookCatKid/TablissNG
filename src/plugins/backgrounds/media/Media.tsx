import React from "react";
import { useObjectUrl, useBackgroundRotation } from "../../../hooks";
import { db } from "../../../db/state";
import { useValue } from "../../../lib/db/react";
import BaseBackground from "../base/BaseBackground";
import { defaultCache, defaultData, Props } from "./types";

const Media: React.FC<Props> = ({
  cache = defaultCache,
  setCache,
  data = defaultData,
  setData,
}) => {
  const normalizedCache = React.useMemo(() => {
    if (Array.isArray(cache)) {
      return {
        items: cache as File[],
        cursor: 0,
        rotated: Date.now(),
        deps: [],
      };
    }
    return cache;
  }, [cache]);

  // If legacy cache is an old File[] array, convert it to the new cache format
  React.useEffect(() => {
    if (Array.isArray(cache)) {
      setCache?.(normalizedCache);
    }
  }, [cache, normalizedCache, setCache]);

  const { item, go, handlePause } = useBackgroundRotation({
    fetch: () => Promise.resolve([]),
    cacheObj: { cache: normalizedCache, setCache },
    data,
    setData,
    deps: [],
  });

  const file = item;
  const url = useObjectUrl(file);
  const background = useValue(db, "background");
  const { scale, position } = background.display;

  if (!file || !url) return null;

  const isVideo = file.type.match(/^video\/(mp4|webm|ogg)$/);

  return (
    <BaseBackground
      containerClassName="Image fullscreen"
      url={url}
      paused={data?.paused ?? false}
      onPause={handlePause}
      onPrev={go(-1)}
      onNext={go(1)}
    >
      {isVideo && (
        <video
          autoPlay
          muted
          playsInline
          loop
          className="video fullscreen"
          src={url}
          style={{
            objectFit: scale ? "cover" : "contain",
            objectPosition: position,
          }}
        />
      )}
    </BaseBackground>
  );
};

export default Media;
