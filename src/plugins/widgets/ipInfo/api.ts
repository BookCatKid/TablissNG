import { API } from "../../types";
import { IpData } from "./types";

export async function getIpInfo(loader: API["loader"]): Promise<IpData> {
  loader.push();

  const primary = fetch("https://www.gogeoip.com/json/?user")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`gogeoip.com failed: ${res.status}`);
      }

      return res.json();
    })
    .then((data) => ({
      ip: data.network.ip,
      city: data.location.city,
      country: data.location.country.name,
      region: data.location.region_name,
    }))
    .catch((error) => {
      console.error("gogeoip.com fetch error:", error);
      throw error;
    })
    .catch(() =>
      fetch("https://ipinfo.io/json?inc=ip,city,country,region")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`ipinfo.io failed: ${res.status}`);
          }
          return res.json();
        })
        .catch(() => fetch("https://ipwho.is").then((res) => res.json())),
    );

  const data = await primary.finally(() => loader.pop());

  return {
    ip: data.ip,
    city: data.city || data.region || "",
    country: data.country,
  };
}
