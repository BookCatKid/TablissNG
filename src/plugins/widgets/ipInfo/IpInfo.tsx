import { type FC, useCallback, useEffect } from "react";

import { usePushError } from "../../../api";
import { SECONDS } from "../../../utils";
import { getIpInfo } from "./api";
import { defaultData, Props } from "./types";

const IpInfo: FC<Props> = ({ cache, data = defaultData, setCache, loader }) => {
  const pushError = usePushError();

  const refreshData = useCallback(() => {
    void getIpInfo(loader).then(setCache).catch(pushError);
  }, [loader, setCache, pushError]);

  useEffect(() => {
    // Always refresh on page load so the displayed IP info is current
    refreshData();

    if (!data.autoRefresh) return;

    // Auto-refresh: also fetch every 30 seconds
    const interval = window.setInterval(() => {
      refreshData();
    }, 30 * SECONDS);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [data.autoRefresh]);

  if (!cache) {
    return null;
  }

  const ip = data.maskIP
    ? cache.ip
        .split(".")
        .map((segment, index) =>
          index > 0 && index < 3 ? segment.replace(/\d+/, "*") : segment,
        )
        .join(".")
    : cache.ip;

  const info: string[] = [];

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
