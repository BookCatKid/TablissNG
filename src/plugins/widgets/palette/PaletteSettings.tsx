import { FC } from "react";
import { FormattedMessage } from "react-intl";

import { timingMessages } from "../../../locales/messages";
import { getRandomColorPalette } from "./api";
import { Data, defaultData, Props } from "./types";

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
          description="Label for the color format dropdown"
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
            <FormattedMessage
              id="plugins.palette.hex"
              defaultMessage="HEX"
              description="Dropdown option for HEX color format"
            />
          </option>
          <option value="rgb">
            <FormattedMessage
              id="plugins.palette.rgb"
              defaultMessage="RGB"
              description="Dropdown option for RGB color format"
            />
          </option>
          <option value="hex_hidden">
            <FormattedMessage
              id="plugins.palette.hexHidden"
              defaultMessage="HEX (hidden)"
              description="Dropdown option for HEX color format that is hidden by default"
            />
          </option>
          <option value="rgb_hidden">
            <FormattedMessage
              id="plugins.palette.rgbHidden"
              defaultMessage="RGB (hidden)"
              description="Dropdown option for RGB color format that is hidden by default"
            />
          </option>
        </select>
      </label>

      <label>
        <FormattedMessage
          id="plugins.palette.refreshInterval"
          defaultMessage="Refresh Palette"
          description="Label for the palette refresh interval dropdown"
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
          description="Button text to manually generate a new color palette"
        />
      </button>
    </div>
  );
};

export default PaletteSettings;
