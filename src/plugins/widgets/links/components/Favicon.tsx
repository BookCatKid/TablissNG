import React, { FC } from "react";

interface FaviconProps {
  icon: string;
  domain: string | null;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
  resolution?: number; // Fetch resolution (iconSize)
}

export const Favicon: FC<FaviconProps> = ({
  icon,
  domain,
  width,
  height,
  conserveAspectRatio,
  resolution = 256,
}) => {
  if (!domain) return null;

  const style = {
    width: `${width}px`,
    height: conserveAspectRatio ? "auto" : `${height}px`,
  };
  const res = resolution ?? 256;

  if (icon === "_favicon_duckduckgo") {
    return (
      <span className="Link-icon">
        <img
          alt={domain}
          src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          style={style}
        />
      </span>
    );
  }

  if (icon === "_favicon_google" || icon === "_favicon") {
    return (
      <span className="Link-icon">
        <img
          alt={domain}
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${res}`}
          style={style}
        />
      </span>
    );
  }

  if (icon === "_favicon_favicone") {
    return (
      <span className="Link-icon">
        <img
          alt={domain}
          src={`https://favicone.com/${domain}?s=${res}`}
          style={style}
        />
      </span>
    );
  }

  return null;
};
