import React from "react";
import "./Logo.sass";
import tablissLogo from "./tabliss.svg";

const Logo: React.FC = () => (
  <h1 className="Logo">
    <i dangerouslySetInnerHTML={{ __html: tablissLogo }} />
  </h1>
);

export default Logo;
