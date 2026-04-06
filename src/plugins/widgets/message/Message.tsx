import { FC } from "react";

import { defaultData, Props } from "./types";

const Message: FC<Props> = ({ data = defaultData }) => (
  <div className="Message">
    <h3 style={{ whiteSpace: "pre" }}>{data.messages[0]}</h3>
  </div>
);

export default Message;
