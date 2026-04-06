import { type FC, useEffect, useMemo } from "react";

import { db } from "../../../db/state";
import { useBackgroundRotation, useObjectUrl } from "../../../hooks";
import { useValue } from "../../../lib/db/react";
import BaseBackground from "../base/BaseBackground";
import { defaultCache, defaultData, Props } from "./types";

const Media: FC<Props> = ({
  cache = defaultCache,
  setCache,
  data = defaultData,
  setData,
}) => {
  const normalizedCache = useMemo(() => {
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
  useEffect(() => {
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

  // Only show controls if there's more than one item to navigate through
  const hasControls = normalizedCache.items?.length > 1;

  return (
    <BaseBackground
      containerClassName="Image fullscreen"
      url={url}
      paused={data?.paused ?? false}
      onPause={handlePause}
      onPrev={go(-1)}
      onNext={go(1)}
      showControls={hasControls}
      controlsOnHover={hasControls && !data.showControls}
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
