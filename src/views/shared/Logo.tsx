import "./Logo.sass";

import type { FC } from "react";

import tablissLogo from "./tabliss.svg";

const Logo: FC = () => (
  <h1 className="Logo">
    <i dangerouslySetInnerHTML={{ __html: tablissLogo }} />
  </h1>
);

export default Logo;
