import { FC } from "react";

import { defaultData, Props } from "./types";

const Colour: FC<Props> = ({ data = defaultData }) => (
  <div className="Colour fullscreen" style={{ backgroundColor: data.colour }} />
);

export default Colour;
