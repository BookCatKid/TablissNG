import React, { FC } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import LocationInput from "./LocationInput";
import { defaultData, Props } from "./types";
import { pluginMessages } from "../../../locales/messages";

const WeatherSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();
  return (
    <div className="WeatherSettings">
      <LocationInput
        latitude={data.latitude}
        longitude={data.longitude}
        onChange={(location) => setData({ ...data, ...location })}
      />

      {data.latitude && data.latitude ? (
        <>
          <label>
            <FormattedMessage
              id="plugins.weather.locationName"
              defaultMessage="Location display name"
              description="Location name title"
            />

            <input
              type="text"
              value={data.name || ""}
              placeholder={intl.formatMessage(pluginMessages.namePlaceholder)}
              onChange={(event) =>
                setData({ ...data, name: event.target.value || undefined })
              }
            />
          </label>

          <hr />

          <label>
            <input
              type="checkbox"
              checked={data.showDetails}
              onChange={() =>
                setData({ ...data, showDetails: !data.showDetails })
              }
            />{" "}
            <FormattedMessage
              id="plugins.weather.showDetails"
              defaultMessage="Show extended details"
              description="Show extended details title"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={data.showCity}
              onChange={() => setData({ ...data, showCity: !data.showCity })}
            />{" "}
            <FormattedMessage
              id="plugins.weather.showCity"
              defaultMessage="Show city display name"
              description="Show city display name title"
            />
          </label>

          <label>
            <input
              type="radio"
              checked={data.units === "si"}
              onChange={() => setData({ ...data, units: "si" })}
            />{" "}
            <FormattedMessage
              id="plugins.weather.metricUnits"
              defaultMessage="Metric units"
              description="Metric units title"
            />
          </label>

          <label>
            <input
              type="radio"
              checked={data.units === "us"}
              onChange={() => setData({ ...data, units: "us" })}
            />{" "}
            <FormattedMessage
              id="plugins.weather.imperialUnits"
              defaultMessage="Imperial units"
              description="Imperial units title"
            />
          </label>

          <p>
            <a
              href="https://open-meteo.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FormattedMessage
                id="plugins.weather.dataBy"
                defaultMessage="Weather data by Open-Meteo.com"
                description="Weather data title"
              />
            </a>
          </p>
        </>
      ) : null}
    </div>
  );
};

export default WeatherSettings;
