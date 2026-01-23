import React, { FC } from "react";
import { FormattedMessage } from "react-intl";

import { Props, defaultData } from "./types";

const GradientSettings: FC<Props> = ({ data = defaultData, setData }) => (
  <div className="GradientSettings">
    <label>
      <input
        type="checkbox"
        checked={data.isRandom}
        onChange={(event) =>
          setData({ ...data, isRandom: event.target.checked })
        }
      />{" "}
      <FormattedMessage
        id="backgrounds.gradient.useRandomGradients"
        defaultMessage="Use Random Gradients"
        description="Use Random Gradients title"
      />
    </label>

    {data.isRandom && data.currentGradientName && (
      <p
        style={{
          margin: "0.5rem 0",
          padding: "0.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
        }}
      >
        <FormattedMessage
          id="backgrounds.gradient.currentGradient.prefix"
          defaultMessage="Current Gradient:"
          description="Label prefix for current gradient name"
        />{" "}
        {data.currentGradientName}
      </p>
    )}

    <label>
      <FormattedMessage
        id="backgrounds.gradient.type"
        defaultMessage="Type"
        description="Label for gradient type selection"
      />
      <select
        value={data.type}
        onChange={(event) =>
          setData({
            ...data,
            type: event.target.value as "linear-gradient" | "radial-gradient",
          })
        }
      >
        <option value="linear-gradient">
          <FormattedMessage
            id="backgrounds.gradient.type.linear"
            defaultMessage="Linear"
            description="Linear gradient type option"
          />
        </option>
        <option value="radial-gradient">
          <FormattedMessage
            id="backgrounds.gradient.type.radial"
            defaultMessage="Radial"
            description="Radial gradient type option"
          />
        </option>
      </select>
    </label>

    {data.type === "linear-gradient" && (
      <label>
        <FormattedMessage
          id="backgrounds.gradient.angle"
          defaultMessage="Angle (0-360)"
          description="Label for gradient angle input"
        />
        <input
          type="number"
          value={data.angle}
          onChange={(event) =>
            setData({ ...data, angle: Number(event.target.value) })
          }
          min={0}
          max={360}
        />
      </label>
    )}

    {!data.isRandom && (
      <>
        <label>
          <FormattedMessage
            id="backgrounds.gradient.fromColor"
            defaultMessage="From Colour"
            description="Label for gradient start color picker"
          />
          <input
            type="color"
            value={data.from}
            onChange={(event) => setData({ ...data, from: event.target.value })}
          />
        </label>

        <label>
          <FormattedMessage
            id="backgrounds.gradient.toColor"
            defaultMessage="To Colour"
            description="Label for gradient end color picker"
          />
          <input
            type="color"
            value={data.to}
            onChange={(event) => setData({ ...data, to: event.target.value })}
          />
        </label>
      </>
    )}
  </div>
);

export default GradientSettings;
