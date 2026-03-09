import React, { FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ColorProps } from "./types";
import { rgbToHex, getContrastColor } from "./utils";

type Props = ColorProps & {
  format: "hex" | "rgb";
  showLabel: boolean;
};

const Color: FC<Props> = ({ displayColor, format, showLabel }) => {
  const [copied, setCopied] = useState(false);

  if (!displayColor || displayColor.length < 3) {
    return null;
  }

  const [r, g, b] = displayColor;
  const hex = rgbToHex(r, g, b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const colorCode = format === "hex" ? hex : rgb;
  const contrastColor = getContrastColor(r, g, b);

  const handleCopy = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      alert(
        "Clipboard API not available or writeText not supported. Please ensure you are in a secure context (HTTPS) and have granted clipboard permissions.",
      );
      console.error("Clipboard API not available or writeText not supported.");
      return;
    }

    navigator.clipboard
      .writeText(colorCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        alert(
          "Failed to copy to clipboard. Please check console for more details and ensure permissions are granted.",
        );
        console.error("Failed to copy to clipboard:", err);
      });
  };

  const style = {
    backgroundColor: rgb,
    color: contrastColor,
  };

  return (
    <div
      className="Color"
      style={style}
      onClick={handleCopy}
      title={`Click to copy ${colorCode}`}
    >
      <span className={`label ${showLabel || copied ? "visible" : ""}`}>
        {copied ? (
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
