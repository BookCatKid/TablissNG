import type { InputHTMLAttributes } from "react";
import { FC, useEffect, useState } from "react";

import { useDebounce } from "../../hooks";

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  onChange: (value: string) => void;
  value?: string;
  wait?: number;
}

export const DebounceInput: FC<Props> = ({
  wait = 1000,
  onChange,
  ...props
}) => {
  const [newValue, setNewValue] = useState(props.value || "");
  const debouncedValue = useDebounce(newValue, wait);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <input
      {...props}
      value={newValue}
      onChange={(event) => setNewValue(event.target.value)}
    />
  );
};
