import { FC, useMemo } from "react";

import { defaultData, Props } from "./types";

const Html: FC<Props> = ({ data = defaultData }) => {
  const html = useMemo(() => ({ __html: data.input }), [data.input]);

  return <div className="Html" dangerouslySetInnerHTML={html} />;
};

export default Html;
