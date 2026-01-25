import React from "react";
import BaseBackground from "../base/BaseBackground";
import { getImage } from "./api";
import { defaultData, Props } from "./types";
import "./Bing.sass";

const Bing: React.FC<Props> = ({
  cache,
  data = defaultData,
  loader,
  setCache,
}) => {
  const [image, setImage] = React.useState(cache);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    const imagePromise = getImage(data, loader);
    imagePromise.then(setCache).catch(() => {});
    if (mounted.current || !image) {
      imagePromise.then(setImage).catch(() => {});
    }
    mounted.current = true;
  }, [data.locale, data.date, data.customDate]);

  const leftInfo = image?.title
    ? [
        {
          label: image.title,
          url: `https://www.bing.com/search?q=${encodeURIComponent(image.title)}`,
        },
      ]
    : [];

  const rightInfo = image?.copyright
    ? {
        label: image.copyright,
      }
    : null;

  return (
    <BaseBackground
      containerClassName="Bing fullscreen"
      url={image?.url ?? null}
      showControls={false}
      showInfo={data.showTitle}
      leftInfo={leftInfo}
      rightInfo={rightInfo}
    />
  );
};

export default Bing;
