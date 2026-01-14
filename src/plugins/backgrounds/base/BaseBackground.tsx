import React from "react";
import { FormattedMessage } from "react-intl";
import { Icon } from "@iconify/react";
import Backdrop from "../../../views/shared/Backdrop";
import "./BaseBackground.sass";

export const UTM =
  "?utm_source=Start&utm_medium=referral&utm_campaign=api-credit";

type Credit = {
  imageLink: string;
  userLink: string;
  userName: string;
  location?: string;
};

interface Props {
  containerClassName?: string;
  url: string | null;
  ready?: boolean;
  title?: React.ReactNode;
  paused?: boolean;
  onPause?: () => void;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  credit?: Credit | null;
  locationSource?: string | undefined;
  children?: React.ReactNode;
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
  } as const;
  return urls[locationSource as keyof typeof urls];
};

const BaseBackground: React.FC<Props> = ({
  containerClassName = "Unsplash fullscreen",
  url,
  ready = false,
  title,
  paused = false,
  onPause = () => {},
  onPrev = null,
  onNext = null,
  credit = null,
  locationSource,
  children,
}) => (
  <div className={`${containerClassName} bg-base`}>
    <Backdrop className="image fullscreen" ready={ready} url={url} />

    {title ? <div className="background-title">{title}</div> : null}

    {children}

    <div className="credit">
      {credit ? (
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
      ) : null}

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

      {credit && credit.location && (
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
  </div>
);

export default React.memo(BaseBackground);
