import React from "react";
import { Image } from "./types";

interface Props {
  title: string;
  copyright?: string;
}

const Credit: React.FC<Props> = ({ title, copyright }) => (
  <div className="title" style={{ lineHeight: 0 }}>
    <p
      className="wikimedia-credit-title"
      dangerouslySetInnerHTML={{ __html: title }}
    ></p>
    {copyright && (
      <p
        className="wikimedia-credit-copyright"
        style={{ textAlign: "right" }}
        dangerouslySetInnerHTML={{ __html: `&copy; ${copyright}` }}
      ></p>
    )}
  </div>
);

export default Credit;
