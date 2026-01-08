import React, { ChangeEvent } from "react";
import { FC } from "react";

interface ListCheckboxProps {
  index: number;
  listID: string;
  label: string;
  checked?: boolean;
  onChange: (listID: string) => void;
}

const ListCheckbox: FC<ListCheckboxProps> = ({
  index,
  listID,
  label,
  checked = false,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onChange(listID);
  };

  return (
    <label key={listID}>
      <input
        type="checkbox"
        checked={checked}
        id={`${index}`}
        onChange={handleChange}
      />{" "}
      <span className="label">{label}</span>
    </label>
  );
};

export default ListCheckbox;
