import React from "react";
import Backdrop from "../../../views/shared/Backdrop";
import { getImage } from "./api";
import { defaultData, Props } from "./types";
import "./Bing.sass";
import BingTitle from "./BingTitle";

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

  return (
    <div className="Bing fullscreen">
      <Backdrop
        className="picture fullscreen"
        ready={!!image?.url}
        url={image?.url || ""}
      >
        {image && data.showTitle && (
          <>
            <div className="bing-credit title" style={{ lineHeight: 0 }}>
              {image.title && <p>{image.title}</p>}
              {image.copyright && (
                <p style={{ textAlign: "right" }}>&copy; {image.copyright}</p>
              )}
            </div>
            <BingTitle title={image.title} copyright={image.copyright} />
          </>
        )}
      </Backdrop>
    </div>
  );
};

export default Bing;
