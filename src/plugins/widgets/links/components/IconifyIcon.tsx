import { Icon } from "@iconify/react";
import type { FC } from "react";

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
  conserveAspectRatio,
}) => {
  if (!iconString) return null;
  return (
    <span className="Link-icon">
      <Icon
        icon={iconString}
        width={width}
        height={height}
        preserveAspectRatio={conserveAspectRatio ? undefined : "none"}
      />
    </span>
  );
};
