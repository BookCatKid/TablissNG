import React, { FC } from "react";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";
import { Props, defaultData } from "./types";
import { timingMessages } from "../../../locales/messages";

const CustomTextSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const handleTimeoutChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setData({ ...data, timeout: value === -1 ? data.timeout : value });
  };

  return (
    <div className="CustomTextSettings">
      <label>
        <span style={{ float: "right" }}>
          {data.paused ? (
            <span className="text--grey">
              <FormattedMessage
                id="plugins.customText.paused"
                defaultMessage="(Paused)"
                description="Text shown when rotation is paused"
              />{" "}
            </span>
          ) : null}
          <a onClick={() => setData({ ...data, paused: !data.paused })}>
            <Icon icon={`feather:${data.paused ? "play" : "pause"}`} />
          </a>
        </span>
        <FormattedMessage
          id="plugins.customText.showNewText"
          defaultMessage="Show a new text"
          description="Label for text rotation interval dropdown"
        />
        <select
          value={
            data.timeout === 0 ||
            data.timeout === 300 ||
            data.timeout === 900 ||
            data.timeout === 3600 ||
            data.timeout === 86400 ||
            data.timeout === 604800
              ? data.timeout
              : -1
          }
          onChange={handleTimeoutChange}
        >
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
            <FormattedMessage {...timingMessages.everyWeek} />
          </option>
          {/* TODO: Add the custom interval for the unplash background too */}
          <option value="-1">
            <FormattedMessage
              id="plugins.customText.customInterval"
              defaultMessage="Custom Interval"
              description="Label for custom interval option"
            />
          </option>
        </select>
      </label>

      {data.timeout !== 0 &&
        data.timeout !== 300 &&
        data.timeout !== 900 &&
        data.timeout !== 3600 &&
        data.timeout !== 86400 &&
        data.timeout !== 604800 && (
          <label>
            <FormattedMessage
              id="plugins.customText.customIntervalSeconds"
              defaultMessage="Custom Interval (seconds)"
              description="Label for custom interval input in seconds"
            />
            <input
              type="number"
              min="0"
              value={data.timeout}
              onChange={(event) =>
                setData({ ...data, timeout: Number(event.target.value) })
              }
            />
          </label>
        )}

      <label>
        <FormattedMessage
          id="plugins.customText.text"
          defaultMessage="Text"
          description="Label for text input"
        />
        <textarea
          style={{ resize: "vertical", overflow: "scroll" }}
          value={data.text}
          rows={10}
          onChange={(event) => setData({ ...data, text: event.target.value })}
        />
      </label>

      <label>
        <FormattedMessage
          id="plugins.customText.separator"
          defaultMessage="Separator"
          description="Label for separator input"
        />
        <input
          type="text"
          value={data.separator}
          disabled={data.atNewline}
          onChange={(event) =>
            setData({ ...data, separator: event.target.value })
          }
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.atNewline}
          onChange={(event) => {
            setData({
              ...data,
              separator: "",
              atNewline: event.target.checked,
            });
          }}
        />{" "}
        <FormattedMessage
          id="plugins.customText.separateAtNewline"
          defaultMessage="Separate at newline"
          description="Label for newline separation checkbox"
        />
      </label>
    </div>
  );
};

export default CustomTextSettings;
