import type { FC } from "react";

import { Icon } from "../../../../icons";

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
        name={iconString}
        width={`${width}`}
        height={`${height}`}
        preserveAspectRatio={conserveAspectRatio ? undefined : "none"}
      />
    </span>
  );
};
