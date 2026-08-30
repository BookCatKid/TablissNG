import { type CSSProperties, FC } from "react";

import { Icon as SvgIcon } from "../../../icons";

type Props = {
  colour?: string;
  name: string;
  size?: number | string;
  style?: CSSProperties;
};

const Icon: FC<Props> = ({
  colour = "currentColor",
  name,
  size = 24,
  style,
}) => (
  <i>
    <SvgIcon
      name={name.startsWith("feather:") ? name : `feather:${name}`}
      width={size}
      height={size}
      color={colour}
      style={style}
    />
  </i>
);

export default Icon;
