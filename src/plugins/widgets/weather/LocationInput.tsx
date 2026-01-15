import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { useToggle } from "../../../hooks";
import { Icon } from "@iconify/react";
import { geocodeLocation, requestLocation } from "./api";
import "./LocationInput.sass";
import { Coordinates } from "./types";

const messages = defineMessages({
  cityOrLocation: {
    id: "plugins.weather.cityOrLocation",
    defaultMessage: "City or location",
    description: "City or location placeholder",
  },
  latitude: {
    id: "plugins.weather.latitude",
    defaultMessage: "Latitude",
    description: "Latitude title and placeholder",
  },
  longitude: {
    id: "plugins.weather.longitude",
    defaultMessage: "Longitude",
    description: "Longitude title and placeholder",
  },
  enterCoordinates: {
    id: "plugins.weather.enterCoordinates",
    defaultMessage: "Enter coordinates",
    description: "Link text to switch to coordinate input",
  },
  searchForCity: {
    id: "plugins.weather.searchForCity",
    defaultMessage: "Search for city",
    description: "Link text to switch to city search",
  },
  unableToFindLocation: {
    id: "plugins.weather.unableToFindLocation",
    defaultMessage: "Unable to find location. Please try again.",
    description: "Message displayed when location cannot be found",
  },
  cannotDetermineLocation: {
    id: "plugins.weather.cannotDetermineLocation",
    defaultMessage: "Cannot determine your location: {err}",
    description: "Message displayed when location cannot be determined",
  },
});

type Props = {
  latitude?: number;
  longitude?: number;
  onChange: (location: Coordinates & { name?: string }) => void;
};

const GeocodeInput: React.FC<Props> = ({ onChange }) => {
  const [query, setQuery] = React.useState("");
  const intl = useIntl();

  const handleGeocode = (event: React.FormEvent) => {
    event.preventDefault();
    geocodeLocation(query)
      .then((coords) => onChange({ ...coords, name: query }))
      .catch(() => {
        alert(intl.formatMessage(messages.unableToFindLocation));
      });
  };

  return (
    <form onSubmit={handleGeocode}>
      <div className="grid" style={{ gridTemplateColumns: "1fr auto" }}>
        <label htmlFor="LocationInput__query">
          <FormattedMessage {...messages.searchForCity} />
        </label>

        <div />

        <input
          id="LocationInput__query"
          placeholder={intl.formatMessage(messages.cityOrLocation)}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit" className="button--primary button--icon">
          <Icon icon="feather:search" />
        </button>
      </div>
    </form>
  );
};

const geolocationAvailable = "geolocation" in navigator;

const CoordinateInput: React.FC<Props> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const intl = useIntl();

  const handleLocate = () => {
    requestLocation()
      .then(onChange)
      .catch((err) =>
        alert(
          intl.formatMessage(messages.cannotDetermineLocation, {
            err: err.message,
          }),
        ),
      );
  };

  return (
    <div className="LocationInput">
      <div
        className="grid"
        style={{
          gridTemplateColumns: geolocationAvailable
            ? "1fr 1fr auto"
            : "1fr 1fr",
        }}
      >
        <label htmlFor="LocationInput__latitude">
          <FormattedMessage {...messages.latitude} />
        </label>

        <label htmlFor="LocationInput__longitude">
          <FormattedMessage {...messages.longitude} />
        </label>

        {geolocationAvailable && <div />}

        <input
          id="LocationInput__latitude"
          placeholder={intl.formatMessage(messages.latitude)}
          type="text"
          value={latitude}
          onChange={(event) =>
            onChange({ latitude: Number(event.target.value) })
          }
        />

        <input
          id="LocationInput__longitude"
          placeholder={intl.formatMessage(messages.longitude)}
          type="text"
          value={longitude}
          onChange={(event) =>
            onChange({ longitude: Number(event.target.value) })
          }
        />

        {geolocationAvailable && (
          <button
            className="button--primary button--icon"
            onClick={handleLocate}
          >
            <Icon icon="feather:navigation" />
          </button>
        )}
      </div>
    </div>
  );
};

const LocationInput: React.FC<Props> = ({ onChange, ...props }) => {
  const hasCoordinates = props.longitude && props.latitude;
  const [lookUp, toggleLookUp] = useToggle(!hasCoordinates);

  const handleChange = (coords: Coordinates) => {
    onChange(coords);
    if (lookUp) toggleLookUp();
  };

  return (
    <div className="LocationInput">
      {lookUp ? (
        <GeocodeInput {...props} onChange={handleChange} />
      ) : (
        <CoordinateInput {...props} onChange={handleChange} />
      )}

      <a onClick={toggleLookUp}>
        {lookUp ? (
          <FormattedMessage {...messages.enterCoordinates} />
        ) : (
          <FormattedMessage {...messages.searchForCity} />
        )}
      </a>
    </div>
  );
};

export default LocationInput;
