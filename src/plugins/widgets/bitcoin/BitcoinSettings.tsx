import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { capitalize } from "../../../utils";
import { defaultData, Data, Props } from "./types";

const messages = defineMessages({
  colorMempool: {
    id: "plugins.bitcoin.colorMempool",
    defaultMessage: "Mempool",
    description: "Mempool color label",
  },
  colorMonochrome: {
    id: "plugins.bitcoin.colorMonochrome",
    defaultMessage: "Monochrome",
    description: "Monochrome color label",
  },
  colorTransparent: {
    id: "plugins.bitcoin.colorTransparent",
    defaultMessage: "Transparent",
    description: "Transparent color label",
  },
});

const colors = ["mempool", "monochrome", "transparent"];

const BitcoinSettings: React.FC<Props> = ({ data = defaultData, setData }) => {
  const intl = useIntl();

  return (
    <div className="BitcoinSettings">
      <h5>
        <FormattedMessage
          id="plugins.bitcoin.colorLabel"
          defaultMessage="Color"
          description="Label for color selection"
        />
      </h5>
      {colors.map((color) => (
        <label key={color}>
          <input
            type="radio"
            checked={data.color === color}
            onChange={() => {
              setData({ ...data, color: color as Data["color"] });
            }}
          />
          {intl.formatMessage(
            messages[`color${capitalize(color)}` as keyof typeof messages],
          )}
        </label>
      ))}

      <label>
        <br />
        <FormattedMessage
          id="plugins.bitcoin.blocksLabel"
          defaultMessage="Number of Blocks"
          description="Label for number of blocks slider"
        />{" "}
        <br />
        <input
          type="range"
          list="numberOfBlocks-markers"
          min="1"
          max="5"
          step="1"
          value={data.numberOfBlocks}
          onChange={(event) => {
            setData({
              ...data,
              numberOfBlocks: Number(
                event.target.value,
              ) as Data["numberOfBlocks"],
            });
          }}
        />
        <datalist id="numberOfBlocks-markers">
          <option value="1" label="1" />
          <option value="2" label="2" />
          <option value="3" label="3" />
          <option value="4" label="4" />
          <option value="5" label="5" />
        </datalist>
      </label>
    </div>
  );
};

export default BitcoinSettings;
