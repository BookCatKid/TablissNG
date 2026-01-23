import React from "react";

import Backdrop from "../../../views/shared/Backdrop";

import { getPicture } from "./api";
import "./Apod.sass";
import ApodTitle from "./ApodTitle";
import { defaultData, Props } from "./types";

const Apod: React.FC<Props> = ({
  cache,
  data = defaultData,
  loader,
  setCache,
}) => {
  const [picture, setPicture] = React.useState(cache);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    getPicture(data, loader).then(setCache);
    if (mounted.current || !picture) getPicture(data, loader).then(setPicture);
    mounted.current = true;
  }, [data.customDate, data.date]);

  const extractYouTubeId = React.useCallback((url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    return match ? match[1] : null;
  }, []);

  const imageUrl =
    picture?.media_type === "image"
      ? picture?.hdurl || picture?.url
      : (() => {
          const videoId = extractYouTubeId(picture?.url ?? "");
          return videoId
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            : picture?.thumbnail_url || "";
        })();

  return (
    <div className="Apod fullscreen">
      <Backdrop
        className="picture fullscreen"
        ready={!!imageUrl}
        url={imageUrl}
      >
        {picture && data.showTitle && (
          <ApodTitle title={picture.title} copyright={picture.copyright} />
        )}
      </Backdrop>
    </div>
  );
};

export default Apod;
