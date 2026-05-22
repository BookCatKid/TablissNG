import "./Weather.sass";

import { Icon } from "@iconify/react";
import type { FC } from "react";
import { useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";

import { useCachedEffect, useTime } from "../../../hooks";
import { HOURS } from "../../../utils";
import { getForecast, requestLocation } from "./api";
import { findCurrent, weatherCodes } from "./conditions";
import { defaultData, Props } from "./types";

const messages = defineMessages({
  forecast: {
    id: "plugins.weather.forecast",
    description: "5 day weather forecast title",
    defaultMessage: "5-day forecast",
  },
  high: {
    id: "plugins.weather.high",
    description: "High for temperature high",
    defaultMessage: "High",
  },
  low: {
    id: "plugins.weather.low",
    description: "Low for temperature low",
    defaultMessage: "Low",
  },
  toggleDetails: {
    id: "plugins.weather.toggleDetails",
    description: "Tooltip to toggle weather details",
    defaultMessage: "Toggle weather details",
  },
  apparent: {
    id: "plugins.weather.apparent",
    description: "Apparent/Feels like tempurature",
    defaultMessage: "Feels like",
  },
  humidity: {
    id: "plugins.weather.humidity",
    description: "Humidity",
    defaultMessage: "Humidity",
  },
});

const Weather: FC<Props> = ({
  cache,
  data = defaultData,
  loader,
  setCache,
  setData,
}) => {
  const time = useTime("absolute");
  const intl = useIntl();

  useEffect(() => {
    if (data.autoUpdate) {
      requestLocation()
        .then((coords) => {
          if (
            coords.latitude !== data.latitude ||
            coords.longitude !== data.longitude
          ) {
            setData({ ...data, ...coords });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [data.autoUpdate, data.latitude, data.longitude]);

  // Cache weather data for 6 hours
  useCachedEffect(
    () => {
      getForecast(data, loader).then(setCache);
    },
    cache ? cache.timestamp + 6 * HOURS : 0,
    [data.latitude, data.longitude, data.units],
  );

  const conditions =
    cache && cache.conditions
      ? findCurrent(cache.conditions, time.getTime())
      : null;

  const dailyConditions =
    cache && cache.dailyConditions ? cache.dailyConditions.slice(0, 5) : [];

  // Blank or loading state
  if (!conditions) return <div className="Weather">-</div>;

  return (
    <div className="Weather">
      {data.showSummary && (
        <div
          className="summary"
          onClick={() => setData({ ...data, showDetails: !data.showDetails })}
          title={intl.formatMessage(messages.toggleDetails)}
        >
          {data.name && data.showCity ? <span>{data.name}</span> : null}
          <Icon icon={`feather:` + weatherCodes[conditions.weatherCode]} />
          <span className="temperature">
            {Math.round(conditions.temperature)}˚
          </span>
        </div>
      )}

      {data.showDetails && (
        <div className="details">
          <dl>
            <dt>{Math.round(conditions.apparentTemperature)}˚</dt>
            <dd>{intl.formatMessage(messages.apparent)}</dd>
          </dl>
          <dl>
            <dt>{conditions.humidity}%</dt>
            <dd>{intl.formatMessage(messages.humidity)}</dd>
          </dl>
        </div>
      )}

      {data.showForecast && (
        <div
          className="forecast"
          aria-label={intl.formatMessage(messages.forecast)}
        >
          {dailyConditions.map((daily) => (
            <dl className="day" key={daily.timestamp}>
              <dt>
                {intl.formatDate(daily.timestamp, {
                  weekday: "short",
                })}
              </dt>
              <dd className="condition">
                <Icon icon={`feather:${weatherCodes[daily.weatherCode]}`} />
              </dd>
              <dd className="temperatures">
                <span title={intl.formatMessage(messages.high)}>
                  {Math.round(daily.temperatureMax)}˚
                </span>
                <span className="low" title={intl.formatMessage(messages.low)}>
                  {Math.round(daily.temperatureMin)}˚
                </span>
              </dd>
            </dl>
          ))}
        </div>
      )}
    </div>
  );
};

export default Weather;
