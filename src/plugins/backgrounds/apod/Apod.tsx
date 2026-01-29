import React from "react";
import { defaultData, Props } from "./types";
import { getPicture } from "./api";
import BaseBackground from "../base/BaseBackground";

const Apod: React.FC<Props> = ({
  cache,
  data = defaultData,
  loader,
  setCache,
}) => {
  const [picture, setPicture] = React.useState(cache);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    const isUpdate = mounted.current;
    getPicture(data, loader).then((result) => {
      setCache(result);
      if (isUpdate || !picture) setPicture(result);
    });
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
  const leftInfo =
    picture && picture.title && picture.date
      ? [
          {
            label: picture.title,
            url: `https://apod.nasa.gov/apod/ap${picture.date.toString().replace(/-/g, "").substring(2)}.html`,
          },
        ]
      : [];

  const rightInfo =
    picture && picture.copyright
      ? {
          label: picture.copyright,
          url: `https://www.google.com/search?q=${encodeURIComponent(picture.copyright)}`,
        }
      : null;

  return (
    <BaseBackground
      containerClassName="Apod fullscreen"
      url={imageUrl ?? null}
      showControls={false}
      showInfo={data.showTitle}
      leftInfo={leftInfo}
      rightInfo={rightInfo}
    />
  );
};

export default Apod;
