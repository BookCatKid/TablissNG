import React from "react";
import { FC } from "react";
import "./Spinner.sass";

interface SpinnerProps {
  size: number
  className?: string
}

const Spinner: FC<SpinnerProps> = ({
  size,
  className = ""
}) => {
  return <span style={{width: `${size}px`, height: `${size}px`}} className={`loader ${className}`}/>
}

export default Spinner;