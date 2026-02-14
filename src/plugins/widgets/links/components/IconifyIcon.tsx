import React, { FC } from "react";
import { Icon } from "@iconify/react";

interface IconifyIconProps {
  iconString: string;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
}

export const IconifyIcon: FC<IconifyIconProps> = ({
  iconString,
  width,
  height,
  // conserveAspectRatio,
}) => {
  if (!iconString) return null;
  return (
    <span className="Link-icon">
      <Icon
        icon={iconString}
        width={width}
        height={height} // Both width and height need to be set in convserveAspectRatio is false, otherwise icons won't scale.
      />
    </span>
  );
};
