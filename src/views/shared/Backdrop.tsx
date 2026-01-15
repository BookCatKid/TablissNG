import React from "react";
import { CrossFade } from "react-crossfade-simple";
import { db } from "../../db/state";
import { useValue } from "../../lib/db/react";
import { useIsNight } from "../../hooks";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  ready?: boolean;
  url?: string | null;
};

const Backdrop: React.FC<Props> = ({
  children,
  ready = true,
  url,
  style = {},
  ...rest
}) => {
  const focus = useValue(db, "focus");
  // TODO: Consider passing display in via prop
  const background = useValue(db, "background");
  const { blur, luminosity = 0, nightDim, scale } = background.display;
  const isNight = useIsNight();

  style = { ...style };

  if (blur && !focus) {
    style["filter"] = `blur(${blur}px)`;
    style["transform"] = `scale(${blur / 500 + 1})`;
  }

  if (luminosity !== null && !focus) {
    if (nightDim && isNight) {
      style["opacity"] = (luminosity + 1) / 2;
    } else {
      style["opacity"] = 1 - Math.abs(luminosity);
    }
  }

  if (scale || scale == null) {
    style["backgroundSize"] = "cover";
  } else if (!scale) {
    style["backgroundSize"] = "contain";
    style["backgroundRepeat"] = "no-repeat";
  }

  return (
    <div
      className="fullscreen"
      style={{ backgroundColor: luminosity > 0 ? "white" : "black" }}
    >
      <CrossFade contentKey={url || ""} timeout={2500}>
        <div
          style={{
            ...style,
            backgroundImage: url ? `url(${url})` : undefined,
          }}
          {...rest}
        >
          {children}
        </div>
      </CrossFade>
    </div>
  );
};

export default Backdrop;
