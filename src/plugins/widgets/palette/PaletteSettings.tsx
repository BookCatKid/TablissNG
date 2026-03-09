import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { getRandomColorPalette } from "./api";
import { defaultData, Props, Data } from "./types";
import { timingMessages } from "../../../locales/messages";

const PaletteSettings: FC<Props> = ({
  cache,
  data = defaultData,
  setData,
  loader,
  setCache,
}) => {
  const handleRefresh = () => {
    if (cache) {
      setCache({ ...cache, isLoading: true });
    }
    getRandomColorPalette(loader).then(setCache);
  };

  return (
    <div className="PaletteSettings">
      <label>
        <FormattedMessage
          id="plugins.palette.colorFormat"
          defaultMessage="Color Format"
        />
        <select
          value={data.colorFormat}
          onChange={(e) =>
            setData({
              ...data,
              colorFormat: e.target.value as Data["colorFormat"],
            })
          }
        >
          <option value="hex">
            <FormattedMessage id="plugins.palette.hex" defaultMessage="HEX" />
          </option>
          <option value="rgb">
            <FormattedMessage id="plugins.palette.rgb" defaultMessage="RGB" />
          </option>
          <option value="hex_hidden">
            <FormattedMessage
              id="plugins.palette.hexHidden"
              defaultMessage="HEX (hidden)"
            />
          </option>
          <option value="rgb_hidden">
            <FormattedMessage
              id="plugins.palette.rgbHidden"
              defaultMessage="RGB (hidden)"
            />
          </option>
        </select>
      </label>

      <label>
        <FormattedMessage
          id="plugins.palette.refreshInterval"
          defaultMessage="Refresh Palette"
        />
        <select
          value={data.refreshInterval}
          onChange={(e) =>
            setData({ ...data, refreshInterval: Number(e.target.value) })
          }
        >
          <option value={0}>
            <FormattedMessage {...timingMessages.everyNewTab} />
          </option>
          <option value={300}>
            <FormattedMessage {...timingMessages.every5min} />
          </option>
          <option value={900}>
            <FormattedMessage {...timingMessages.every15min} />
          </option>
          <option value={3600}>
            <FormattedMessage {...timingMessages.everyHour} />
          </option>
          <option value={86400}>
            <FormattedMessage {...timingMessages.everyDay} />
          </option>
        </select>
      </label>

      <button className="button button--primary" onClick={handleRefresh}>
        <FormattedMessage
          id="plugins.palette.newPalette"
          defaultMessage="Generate new palette"
        />
      </button>
    </div>
  );
};

export default PaletteSettings;
