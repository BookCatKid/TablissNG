import React, { useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCachedEffect, useTime } from "../../../hooks";
import { HOURS } from "../../../utils";
import { Icon } from "@iconify/react";
import { getForecast, requestLocation } from "./api";
import { findCurrent, weatherCodes } from "./conditions";
import { defaultData, Props } from "./types";
import "./Weather.sass";

const messages = defineMessages({
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

const Weather: React.FC<Props> = ({
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

  // Blank or loading state
  if (!conditions) return <div className="Weather">-</div>;

  return (
    <div className="Weather">
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

      {data.showDetails ? (
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
      ) : null}
    </div>
  );
};

export default Weather;
