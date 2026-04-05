import { Icon } from "@iconify/react";
import type { FC } from "react";

interface IconifyIconProps {
  iconString: string;
  width: number;
  height: number;
}

export const IconifyIcon: FC<IconifyIconProps> = ({
  iconString,
  width,
  height,
}) => {
  if (!iconString) return null;
  return (
    <span className="Link-icon">
      <Icon icon={iconString} width={width} height={height} />
    </span>
  );
};
