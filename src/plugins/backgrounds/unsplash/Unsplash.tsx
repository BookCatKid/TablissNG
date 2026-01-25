import React from "react";
import { FormattedMessage } from "react-intl";
import { buildLink, fetchImages } from "./api";
import { defaultData, Image as UnsplashImage, Props } from "./types";
import { useBackgroundRotation } from "../../../hooks";
import BaseBackground from "../base/BaseBackground";

const UTM = "?utm_source=Start&utm_medium=referral&utm_campaign=api-credit";

const getLocationUrl = (location: string, source: string) => {
  const urls = {
    "google-maps": `https://www.google.com/maps/search/?api=1&query=${location}`,
    google: `https://www.google.com/search?tbm=isch&q=${location}`,
    duckduckgo: `https://duckduckgo.com/?q=${location}&iax=images&ia=images`,
    unsplash: `https://unsplash.com/s/photos/${encodeURIComponent(location.replace(/\s+/g, "-").toLowerCase())}`,
  } as const;
  return urls[source as keyof typeof urls] || "#";
};

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

  const credits = item
    ? [
        {
          label: (
            <FormattedMessage
              id="plugins.unsplash.photoLink"
              description="Photo link text"
              defaultMessage="Photo"
            />
          ),
          url: item.credit.imageLink + UTM,
        },
        {
          label: item.credit.userName,
          url: item.credit.userLink + UTM,
        },
        {
          label: "Unsplash",
          url: "https://unsplash.com/" + UTM,
        },
      ]
    : [];

  const location =
    item?.credit.location && data.locationSource
      ? {
          label: item.credit.location,
          url: getLocationUrl(item.credit.location, data.locationSource),
        }
      : null;

  return (
    <BaseBackground
      containerClassName="Unsplash fullscreen"
      url={url}
      showInfo={data.showTitle}
      leftInfo={credits}
      rightInfo={location}
      paused={data.paused ?? false}
      onPause={handlePause}
      onPrev={go(-1)}
      onNext={go(1)}
    />
  );
};

export default Unsplash;
