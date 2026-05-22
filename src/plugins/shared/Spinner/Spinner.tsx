import "./Spinner.sass";

import { FC } from "react";

interface SpinnerProps {
  size: number;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size, className = "" }) => {
  return (
    <span
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`loader ${className}`}
    />
  );
};
