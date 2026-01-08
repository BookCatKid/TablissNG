import React, { FC, useEffect, useState } from "react";
import { Props, defaultCache, defaultData } from "./types";
import Display from "../links/Display";
import "./TopSites.sass";

export const truncateText = (text: string, maxLength: number): string => {
  if (maxLength === 0 || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const cleanTitle = (title: string, url: string): string => {
  // If no title, use hostname
  if (!title) {
    return new URL(url).hostname;
  }

  // TODO: If the title is a url then do something

  // Remove common separators and their content
  const cleaned = title
    .split(/[•|–|-]|:/)[0] // Split on common separators
    .split(" - ")[0] // Handle dash with spaces
    .trim();

  // If cleaned title is empty or just whitespace, fallback to hostname
  if (!cleaned || cleaned.length === 0) {
    return new URL(url).hostname;
  }

  return cleaned;
};

export const TopSites: FC<Props> = ({
  data = defaultData,
  cache = defaultCache,
  setCache,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  const updateTopSites = async (granted: boolean) => {
    setHasPermission(granted);
    if (granted) {
      const sites = await browser.topSites.get();
      setCache?.({
        sites: sites.map((site) => ({
          url: site.url,
          title: site.title || new URL(site.url).hostname,
        })),
      });
    }
  };

  useEffect(() => {
    browser.permissions
      .contains({ permissions: ["topSites"] })
      .then(updateTopSites);
  }, [setCache]);

  const requestPermission = () => {
    browser.permissions
      .request({ permissions: ["topSites"] })
      .then(updateTopSites);
  };

  if (!hasPermission) {
    return (
      <div className="TopSites">
        <button
          className="request-permission"
          style={{ padding: "0.5em 1em" }}
          onClick={requestPermission}
        >
          Top Sites permission required for this widget (click to request)
        </button>
      </div>
    );
  }

  return (
    <div
      className="Links"
      style={{
        gridTemplateColumns: `1fr `.repeat(data.columns),
        textAlign: data.columns > 1 ? "left" : "inherit",
      }}
    >
      {cache.sites.map((site, index) => (
        <Display
          key={index}
          id={site.url + "-" + index}
          url={site.url}
          name={truncateText(
            cleanTitle(site.title || "", site.url),
            data.maxTextLength,
          )}
          icon={data.iconProvider}
          number={index + 1}
          linkOpenStyle={data.linkOpenStyle}
          linksNumbered={data.linksNumbered}
        />
      ))}
    </div>
  );
};

export default TopSites;
