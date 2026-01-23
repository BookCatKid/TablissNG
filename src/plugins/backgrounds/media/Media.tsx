import React from "react";
import { useObjectUrl } from "../../../hooks";
import { db } from "../../../db/state";
import { useValue } from "../../../lib/db/react";
import Backdrop from "../../../views/shared/Backdrop";
import "./Media.sass";
import { defaultCache, Props } from "./types";

const Media: React.FC<Props> = ({ cache = defaultCache }) => {
  const index = React.useMemo(
    () => Math.floor(Math.random() * cache.length),
    [cache.length],
  );
  const item = cache[index];
  const url = useObjectUrl(item);
  const background = useValue(db, "background");
  const { scale, position } = background.display;

  if (!item || !url) return null;

  const isVideo = item.type.match(/^video\/(mp4|webm|ogg)$/);

  return (
    <Backdrop className="Image fullscreen" url={isVideo ? undefined : url}>
      {isVideo && (
        <video
          autoPlay
          loop
          className="video"
          src={url}
          style={{
            objectFit: scale ? "cover" : "contain",
            objectPosition: position,
          }}
        />
      )}
    </Backdrop>
  );
};

export default Media;
