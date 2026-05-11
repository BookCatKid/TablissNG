import { API } from "../../types";
import { Cache, Coordinates, Data } from "./types";

type Config = Pick<Data, "latitude" | "longitude" | "units">;

/** Get current forecast for a location */
export async function getForecast(
  { latitude, longitude, units }: Config,
  loader: API["loader"],
): Promise<Cache> {
  if (!latitude || !longitude) {
    return;
  }

  loader.push();
  const url =
    "https://api.open-meteo.com/v1/forecast?" +
    `latitude=${latitude}&` +
    `longitude=${longitude}&` +
    "hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode&" +
    "daily=weathercode,temperature_2m_max,temperature_2m_min&" +
    "timeformat=unixtime&" +
    "timezone=auto&" +
    `temperature_unit=${units === "us" ? "fahrenheit" : "celsius"}`;
  let body;
  try {
    const res = await fetch(url);
    body = await res.json();
  } finally {
    loader.pop();
  }

  // Process results
  // TODO: validate response
  return {
    timestamp: Date.now(),
    conditions: body.hourly.time.map((time: number, i: number) => ({
      timestamp: time * 1000, // convert to ms
      temperature: body.hourly.temperature_2m[i],
      apparentTemperature: body.hourly.apparent_temperature[i],
      humidity: body.hourly.relativehumidity_2m[i],
      weatherCode: body.hourly.weathercode[i],
    })),
    dailyConditions: body.daily.time.map((time: number, i: number) => ({
      timestamp: time * 1000, // convert to ms
      temperatureMax: body.daily.temperature_2m_max[i],
      temperatureMin: body.daily.temperature_2m_min[i],
      weatherCode: body.daily.weathercode[i],
    })),
  };
}

/** Request current location from the browser */
export function requestLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: round(coords.latitude),
          longitude: round(coords.longitude),
        }),
      reject,
    ),
  );
}

/** Perform geocoding lookup on query string */
export async function geocodeLocation(query: string): Promise<Coordinates> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    latitude: round(data.results[0].latitude),
    longitude: round(data.results[0].longitude),
  };
}

function round(x: number, precision = 4): number {
  return Math.round(x * 10 ** precision) / 10 ** precision;
}
