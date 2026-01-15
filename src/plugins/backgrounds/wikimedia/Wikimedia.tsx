import React from "react";
import Backdrop from "../../../views/shared/Backdrop";
import { fetchFeaturedContent, formatDateForApi } from "./api";
import WikimediaTitle from "./WikimediaTitle";
import "./Wikimedia.sass";
import { defaultData, Props } from "./types";

const Wikimedia: React.FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
}) => {
  const [picture, setPicture] = React.useState(cache);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    const formattedDate =
      data.date === "custom" && data.customDate
        ? formatDateForApi(data.customDate)
        : formatDateForApi(new Date().toISOString());
    const language = "en";
    const params = { language, formattedDate };
    fetchFeaturedContent(params).then((result) => {
      setCache(result);
      if (mounted.current || !picture) setPicture(result);
    });
    mounted.current = true;
  }, [data.customDate, data.date]);

  return (
    <div className="Wikimedia fullscreen">
      <Backdrop
        className="picture fullscreen"
        ready={!!picture?.image?.image?.source}
        url={picture?.image?.image?.source}
      >
        {picture && data.showTitle && (
          <WikimediaTitle
            title={picture.image?.description?.html || ""}
            copyright={picture.image?.artist?.html || ""}
          />
        )}
      </Backdrop>
    </div>
  );
};

export default Wikimedia;
