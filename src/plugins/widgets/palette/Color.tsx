import { FC } from "react";
import { FormattedMessage } from "react-intl";

import { useClipboard } from "../../../hooks";
import { ColorProps } from "./types";
import { getContrastColor, rgbToHex } from "./utils";

type Props = ColorProps & {
  format: "hex" | "rgb";
  showLabel: boolean;
};

const Color: FC<Props> = ({ displayColor, format, showLabel }) => {
  const { copy, copied, error } = useClipboard();

  if (!displayColor || displayColor.length < 3) {
    return null;
  }

  const [r, g, b] = displayColor;
  const hex = rgbToHex(r, g, b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const colorCode = format === "hex" ? hex : rgb;
  const contrastColor = getContrastColor(r, g, b);

  const style = {
    backgroundColor: rgb,
    color: contrastColor,
  };

  return (
    <div
      className="Color"
      style={style}
      onClick={() => copy(colorCode)}
      title={`Click to copy ${colorCode}`}
    >
      <span
        className={`label ${showLabel || copied || error ? "visible" : ""}`}
      >
        {error ? (
          <FormattedMessage
            id="plugins.palette.copyFailed"
            defaultMessage="Failed!"
            description="Message displayed when copying a color code fails"
          />
        ) : copied ? (
          <FormattedMessage
            id="plugins.palette.copied"
            defaultMessage="Copied!"
            description="Message displayed when a color code is copied"
          />
        ) : (
          colorCode
        )}
      </span>
    </div>
  );
};

export default Color;
