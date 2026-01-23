import React from "react";
import { Image } from "./types";

type Props = Pick<Image, "title" | "copyright">;

const Credit: React.FC<Props> = ({ title, copyright }) => (
  <div className="bing-credit title" style={{ lineHeight: 0 }}>
    <p>{title}</p>
    {copyright && <p style={{ textAlign: "right" }}>&copy; {copyright}</p>}
  </div>
);

export default Credit;
