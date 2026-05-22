import { type FC, useLayoutEffect } from "react";

import { defaultData, Props } from "./types";

const Css: FC<Props> = ({ data = defaultData }) => {
  useLayoutEffect(() => {
    const style = document.createElement("style");

    style.id = "CustomCss";
    style.type = "text/css";
    style.appendChild(document.createTextNode(data.input || ""));

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [data.input]);

  return null;
};

export default Css;
