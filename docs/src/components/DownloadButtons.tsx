import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

interface DownloadButtonsProps {
  height?: number | string;
}

export default function DownloadButtons({ height = 60 }: DownloadButtonsProps) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  const storeUrls = customFields?.storeUrls as Record<string, string>;

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px",
        justifyContent: "center",
      }}
    >
      <a href={storeUrls.firefox}>
        <img
          src={useBaseUrl("/img/badges/firefox-badge.svg")}
          height={height}
          alt="Get the Add-on for Firefox"
        />
      </a>
      <a href={storeUrls.chrome}>
        <img
          src={useBaseUrl("/img/badges/chrome-badge.png")}
          alt="Get the Extension on Chrome"
          height={height}
          style={{ borderRadius: "4px" }}
        />
      </a>
      <a href={storeUrls.edge}>
        <img
          src={useBaseUrl("/img/badges/edge-badge.png")}
          alt="Get the Extension on Edge"
          height={height}
          style={{ borderRadius: "4px" }}
        />
      </a>
    </div>
  );
}
