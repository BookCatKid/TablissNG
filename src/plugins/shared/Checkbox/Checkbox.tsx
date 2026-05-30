import { ChangeEvent } from "react";

interface CheckboxProps<T> {
  value: T;
  label: string;
  checked?: boolean;
  onChange: (value: T) => void;
}

/**
 * Controlled checkbox component
 */
export function Checkbox<T>({
  value,
  label,
  checked = false,
  onChange,
}: CheckboxProps<T>) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onChange(value);
  };

  return (
    <label>
      <input type="checkbox" checked={checked} onChange={handleChange} />{" "}
      <span>{label}</span>
    </label>
  );
}
