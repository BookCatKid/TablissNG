import "./BaseBackground.sass";

import { Icon } from "@iconify/react";
import {
  type CSSProperties,
  type FC,
  Fragment,
  memo,
  type ReactNode,
} from "react";
import { CrossFade } from "react-crossfade-simple";

import { db } from "../../../db/state";
import { useIsNight } from "../../../hooks";
import { useValue } from "../../../lib/db/react";

interface CreditLink {
  label: ReactNode;
  url?: string;
}

interface Props {
  containerClassName?: string;
  url: string | null;
  paused?: boolean;
  onPause?: () => void;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  showControls?: boolean;
  controlsOnHover?: boolean;
  showInfo?: boolean;
  leftInfo?: CreditLink[];
  rightInfo?: CreditLink | null;
  children?: ReactNode;
}

const BaseBackground: FC<Props> = ({
  containerClassName = "Unsplash fullscreen",
  url,
  paused = false,
  onPause = () => {},
  onPrev = null,
  onNext = null,
  showControls = true,
  controlsOnHover = false,
  showInfo = true,
  leftInfo = [],
  rightInfo = null,
  children,
}) => {
  // TODO: Consider passing display in via prop
  const focus = useValue(db, "focus");
  const background = useValue(db, "background");
  const {
    blur,
    luminosity = 0,
    nightDim,
    scale = true,
    position,
  } = background.display;
  const isNight = useIsNight();

  const backdropStyle: CSSProperties = {};

  if (blur && !focus) {
    backdropStyle.filter = `blur(${blur}px)`;
    backdropStyle.transform = `scale(${blur / 500 + 1})`;
  }

  if (!focus) {
    if (nightDim && isNight) {
      backdropStyle.opacity = (luminosity + 1) / 2;
    } else {
      backdropStyle.opacity = 1 - Math.abs(luminosity);
    }
  }

  if (scale) {
    backdropStyle.backgroundSize = "cover";
  } else {
    backdropStyle.backgroundSize = "contain";
    backdropStyle.backgroundRepeat = "no-repeat";
  }

  if (position) {
    backdropStyle.backgroundPosition = position;
  }

  return (
    <div className={`${containerClassName} bg-base`}>
      <div
        className="fullscreen"
        style={{ backgroundColor: luminosity > 0 ? "white" : "black" }}
      >
        <CrossFade contentKey={url || ""} timeout={2500}>
          <div
            className="image fullscreen"
            style={{
              ...backdropStyle,
              backgroundImage: url ? `url(${url})` : undefined,
            }}
          >
            {children}
          </div>
        </CrossFade>
      </div>

      <div className="info-bar">
        <div className="left-info">
          {showInfo &&
            leftInfo.map((info, index) => (
              <Fragment key={index}>
                {index > 0 && ", "}
                {info.url ? (
                  <a href={info.url} rel="noopener noreferrer">
                    {info.label}
                  </a>
                ) : (
                  <span>{info.label}</span>
                )}
              </Fragment>
            ))}
        </div>

        {showControls && (
          <div className={`controls ${controlsOnHover ? "is-on-hover" : ""}`}>
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
        )}

        <div className="right-info">
          {showInfo && rightInfo && (
            <>
              {rightInfo.url ? (
                <a href={rightInfo.url} rel="noopener noreferrer">
                  {rightInfo.label}
                </a>
              ) : (
                <span>{rightInfo.label}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(BaseBackground);
