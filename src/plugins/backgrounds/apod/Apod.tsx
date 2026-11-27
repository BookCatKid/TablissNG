import { format } from "date-fns";
import { type FC, useEffect, useState } from "react";

import { usePushError } from "../../../api";
import { db } from "../../../db/state";
import { useValue } from "../../../lib/db/react";
import BaseBackground from "../base/BaseBackground";
import { getPicture, MEDIA_VERSION } from "./api";
import { defaultData, Props } from "./types";
import { useApodAccess } from "./useApodAccess";

const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const isCacheFresh = (
  cache:
    { date?: string; permalink?: string; mediaVersion?: number } | undefined,
  data: { date: string; customDate?: string },
): boolean => {
  // Earlier caches can contain retired URLs, placeholders, or undecodable images.
  if (!cache?.date || !cache.permalink || cache.mediaVersion !== MEDIA_VERSION)
    return false;
  const cachedDate = String(cache.date);
  if (data.date === "custom") {
    return cachedDate === data.customDate;
  }
  return cachedDate === format(new Date(), "yyyy-MM-dd");
};

const Apod: FC<Props> = ({ cache, data = defaultData, loader, setCache }) => {
  const [picture, setPicture] = useState(cache);
  const pushError = usePushError();
  const { hasAccess } = useApodAccess();
  const background = useValue(db, "background");
  const { scale = true, position } = background.display;

  useEffect(() => {
    if (!hasAccess || isCacheFresh(cache, data)) return;
    let active = true;
    getPicture(data, loader)
      .then((result) => {
        if (!active) return;
        setCache(result);
        setPicture(result);
      })
      .catch((error: Error) => {
        if (active) pushError(error);
      });
    return () => {
      active = false;
    };
    // useApi recreates the loader and setters on render; fetch only for date changes.
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [data.customDate, data.date, hasAccess]);

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    return match ? match[1] : null;
  };

  const videoUrl = picture?.url;
  const showVideo =
    picture?.media_type === "video" && videoUrl && isDirectVideo(videoUrl);

  const imageUrl =
    picture?.media_type === "image"
      ? picture?.hdurl || picture?.url
      : showVideo
        ? ""
        : (() => {
            if (picture?.thumbnail_url) return picture.thumbnail_url;
            const videoId = extractYouTubeId(picture?.url ?? "");
            return videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : "";
          })();
  const leftInfo =
    picture && picture.title && picture.date
      ? [
          {
            label: picture.title,
            url: picture.permalink,
          },
        ]
      : [];

  const rightInfo =
    picture && picture.copyright
      ? {
          label: picture.copyright,
          url:
            picture.copyrightUrl ||
            `https://www.google.com/search?q=${encodeURIComponent(picture.copyright)}`,
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
