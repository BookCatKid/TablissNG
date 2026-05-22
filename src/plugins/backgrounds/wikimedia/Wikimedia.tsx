import { format } from "date-fns";
import { type FC, useEffect, useRef, useState } from "react";

import BaseBackground from "../base/BaseBackground";
import { fetchFeaturedContent, formatDateForApi } from "./api";
import { defaultData, Props } from "./types";

const Wikimedia: FC<Props> = ({ cache, data = defaultData, setCache }) => {
  const [picture, setPicture] = useState(cache);
  const mounted = useRef(false);

  useEffect(() => {
    const formattedDate =
      data.date === "custom" && data.customDate
        ? formatDateForApi(data.customDate)
        : formatDateForApi(format(new Date(), "yyyy-MM-dd"));
    const language = "en";
    const params = { language, formattedDate };
    fetchFeaturedContent(params).then((result) => {
      setCache(result);
      if (mounted.current || !picture) setPicture(result);
    });
    mounted.current = true;
  }, [data.customDate, data.date]);

  const leftInfo = picture?.image?.description?.html
    ? [
        {
          label: (
            <span
              dangerouslySetInnerHTML={{
                __html: picture.image.description.html.replace(
                  '"//',
                  '"https://',
                ),
              }}
            />
          ),
        },
      ]
    : [];

  const rightInfo = picture?.image?.artist?.html
    ? {
        label: (
          <span
            dangerouslySetInnerHTML={{
              __html: `© ${picture.image.artist.html.replace('"//', '"https://')}`,
            }}
          />
        ),
      }
    : null;

  return (
    <BaseBackground
      containerClassName="Wikimedia fullscreen"
      url={picture?.image?.image?.source ?? null}
      showControls={false}
      showInfo={data.showTitle}
      leftInfo={leftInfo}
      rightInfo={rightInfo}
    />
  );
};

export default Wikimedia;
