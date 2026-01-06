import React from "react";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";
import { timingMessages } from "../../../locales/messages";

export interface BaseSettingsData {
  timeout?: number;
  paused?: boolean;
}

interface Props<T extends BaseSettingsData> {
  data: T;
  setData: (data: T) => void;
  title?: React.ReactNode;
}

const knownIntervals = [0, 300, 900, 3600, 86400, 604800];

const BaseSettings = <T extends BaseSettingsData>({ data, setData, title }: Props<T>) => {
  const valueForSelect = data.timeout !== undefined && knownIntervals.includes(data.timeout) ? data.timeout : -1;

  const handleTimeoutChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setData({ ...data, timeout: value === -1 ? data.timeout : value });
  };

  return (
    <label>
      <span style={{ float: "right" }}>
        {data.paused ? (
          <span className="text--grey">
            <FormattedMessage
              id="backgrounds.base.paused"
              defaultMessage="(Paused)"
              description="Text shown when rotation is paused"
            />{" "}
          </span>
        ) : null}
        <a onClick={() => setData({ ...data, paused: !data.paused })}>
          <Icon icon={`feather:${data.paused ? "play" : "pause"}`} />
        </a>
      </span>

      {title ? (
        title
      ) : (
        <FormattedMessage
          id="backgrounds.base.showNewPhoto"
          defaultMessage="Show a new photo"
        />
      )}

      <select value={valueForSelect} onChange={handleTimeoutChange}>
        <option value="0">
          <FormattedMessage {...timingMessages.everyNewTab} />
        </option>
        <option value="300">
          <FormattedMessage {...timingMessages.every5min} />
        </option>
        <option value="900">
          <FormattedMessage {...timingMessages.every15min} />
        </option>
        <option value="3600">
          <FormattedMessage {...timingMessages.everyHour} />
        </option>
        <option value="86400">
          <FormattedMessage {...timingMessages.everyDay} />
        </option>
        <option value="604800">
          <FormattedMessage
            id="plugins.everyWeek"
            defaultMessage="Every week"
            description="Every week title"
          />
        </option>
      </select>
    </label>
  );
};

export default BaseSettings;
