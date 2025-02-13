import React, { FC, useMemo } from "react";

import { Props, defaultData } from "./types";

const Html: FC<Props> = ({ data = defaultData }) => {
  const html = useMemo(() => ({ __html: data.input }), [data.input]);

  return <div className="Html" dangerouslySetInnerHTML={html} />;
};

export default Html;
