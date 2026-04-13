import type { FC } from "react";

interface FaviconProps {
  provider: "google" | "duckduckgo" | "favicone";
  domain: string | null;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
  resolution?: number;
}

export const Favicon: FC<FaviconProps> = ({
  provider,
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

  const getSrc = () => {
    switch (provider) {
      case "duckduckgo":
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      case "google":
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=${resolution}`;
      case "favicone":
        return `https://favicone.com/${domain}?s=${resolution}`;
    }
  };

  return (
    <span className="Link-icon">
      <img alt={domain} src={getSrc()} style={style} />
    </span>
  );
};
