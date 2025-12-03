import React from "react";
import { FC } from "react";
import "./Spinner.sass";

interface SpinnerProps {
  size: number
}

const Spinner: FC<SpinnerProps> = ({
  size
}) => {
  return <span style={{width: `${size}px`, height: `${size}px`}} className="loader"/>
}

export default Spinner;