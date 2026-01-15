import React from "react";
import { usePushError } from "../../../api";
import { getIpInfo } from "./api";
import { defaultData, Props } from "./types";

const IpInfo: React.FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  const pushError = usePushError();
  const mounted = React.useRef(false);

  const refreshData = React.useCallback(() => {
    getIpInfo(loader).then(setCache).catch(pushError);
  }, [loader, setCache, pushError]);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (!cache) {
        refreshData();
      }
    }
  }, [cache]); // Only depend on cache to trigger initial load

  if (!cache) {
    return null;
  }

  const ip = data.maskIP
    ? cache.ip
        .split(".")
        .map((s, i) => (i > 0 && i < 3 ? s.replace(/[\d]+/, "*") : s))
        .join(".")
    : cache.ip;
  const info = [];
  if (!data.hideIP) info.push(ip);
  if (data.displayCity) info.push(cache.city);
  if (data.displayCountry) info.push(cache.country);

  return (
    <div
      className="IpInfo"
      onClick={data.clickToRefresh ? refreshData : undefined}
      style={{ cursor: data.clickToRefresh ? "pointer" : "default" }}
      title={data.clickToRefresh ? "Click to refresh IP info" : undefined}
    >
      {info.join(", ")}
    </div>
  );
};

export default IpInfo;
