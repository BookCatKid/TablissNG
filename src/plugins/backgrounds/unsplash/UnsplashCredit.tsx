import React from "react";
import { FormattedMessage } from "react-intl";
import { Icon } from "@iconify/react";
import { Image } from "./types";

export const UTM =
  "?utm_source=Start&utm_medium=referral&utm_campaign=api-credit";

interface Props {
  credit: Image["credit"];
  locationSource: string | undefined;
  paused: boolean;
  onPause: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

const getLocationUrl = (
  location: string | undefined,
  locationSource: string | undefined,
) => {
  if (!location || !locationSource) return "#";
  const urls = {
    "google-maps": `https://www.google.com/maps/search/?api=1&query=${location}`,
    google: `https://www.google.com/search?tbm=isch&q=${location}`,
    duckduckgo: `https://duckduckgo.com/?q=${location}&iax=images&ia=images`,
    unsplash: `https://unsplash.com/s/photos/${encodeURIComponent(location.replace(/\s+/g, "-").toLowerCase())}`,
  };
  return urls[locationSource as keyof typeof urls];
};

const UnsplashCredit: React.FC<Props> = ({
  credit,
  locationSource,
  paused,
  onPause,
  onPrev,
  onNext,
}) => (
  <div className="credit">
    <div className="photo">
      <a href={credit.imageLink + UTM} rel="noopener noreferrer">
        <FormattedMessage
          id="plugins.unsplash.photoLink"
          description="Photo link text"
          defaultMessage="Photo"
        />
      </a>
      {", "}
      <a href={credit.userLink + UTM} rel="noopener noreferrer">
        {credit.userName}
      </a>
      {", "}
      <a href={"https://unsplash.com/" + UTM} rel="noopener noreferrer">
        Unsplash
      </a>
    </div>

    <div className="controls">
      <a className={onPrev ? "" : "hidden"} onClick={onPrev ?? undefined}>
        <Icon icon="feather:arrow-left" />
      </a>{" "}
      <a onClick={onPause}>
        <Icon icon={paused ? "feather:play" : "feather:pause"} />
      </a>{" "}
      <a className={onNext ? "" : "hidden"} onClick={onNext ?? undefined}>
        <Icon icon="feather:arrow-right" />
      </a>
    </div>

    {credit.location && (
      <span className="location-wrapper">
        <a
          className="location"
          href={getLocationUrl(credit.location, locationSource)}
          target="_self"
          rel="noopener noreferrer"
        >
          {credit.location}
        </a>
      </span>
    )}
  </div>
);

export default React.memo(UnsplashCredit);
