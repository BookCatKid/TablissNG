import { format } from "date-fns";
import { type FC, useCallback, useEffect, useRef, useState } from "react";

import { db } from "../../../db/state";
import { useValue } from "../../../lib/db/react";
import BaseBackground from "../base/BaseBackground";
import { getPicture } from "./api";
import { defaultData, Props } from "./types";

const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const isCacheFresh = (
  cache: { date?: Date | string } | undefined,
  data: { date: string; customDate?: string },
): boolean => {
  if (!cache?.date) return false;
  const cachedDate = String(cache.date);
  if (data.date === "custom") {
    return cachedDate === data.customDate;
  }
  return cachedDate === format(new Date(), "yyyy-MM-dd");
};

const Apod: FC<Props> = ({ cache, data = defaultData, loader, setCache }) => {
  const [picture, setPicture] = useState(cache);
  const mounted = useRef(false);
  const background = useValue(db, "background");
  const { scale = true, position } = background.display;

  useEffect(() => {
    if (isCacheFresh(cache, data)) return;
    const isUpdate = mounted.current;
    getPicture(data, loader).then((result) => {
      setCache(result);
      if (isUpdate || !picture) setPicture(result);
    });
    mounted.current = true;
  }, [data.customDate, data.date]);

  const extractYouTubeId = useCallback((url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    return match ? match[1] : null;
  }, []);

  const videoUrl = picture?.url;
  const showVideo =
    picture?.media_type === "video" && videoUrl && isDirectVideo(videoUrl);

  const imageUrl =
    picture?.media_type === "image"
      ? picture?.hdurl || picture?.url
      : showVideo
        ? ""
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
    >
      {showVideo && (
        <video
          autoPlay
          muted
          playsInline
          loop
          className="video fullscreen"
          src={videoUrl}
          style={{
            objectFit: scale ? "cover" : "contain",
            objectPosition: position,
          }}
        />
      )}
    </BaseBackground>
  );
};

export default Apod;
