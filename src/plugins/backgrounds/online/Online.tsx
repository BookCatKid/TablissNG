import { type FC } from "react";

import BaseBackground from "../base/BaseBackground";
import { defaultData, Props } from "./types";

const Online: FC<Props> = ({ data = defaultData }) => {
  return (
    <BaseBackground
      containerClassName="Online fullscreen"
      url={data.url ?? null}
      showControls={false}
    />
  );
};

export default Online;
