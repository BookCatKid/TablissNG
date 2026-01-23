import React from "react";
import { useKeyPress } from "../../../hooks";

interface Props extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> {
  onChange: (value: string) => void;
  value: string;
  onBlur?: () => void;
}

const Input: React.FC<Props> = ({ onChange, value, onBlur, ...props }) => {
  const span = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    if (span.current) {
      span.current.innerText = value;
      span.current.focus();
    }
  }, [value]);

  useKeyPress(
    (event) => {
      if (event.target === span.current && span.current) {
        event.preventDefault();
        span.current.blur();
      }
    },
    ["Escape"],
    false,
  );

  const handleBlur = () => {
    if (span.current) {
      const newValue = span.current.innerText.trim();
      if (newValue !== value) {
        onChange(newValue);
      }
      onBlur?.();
    }
  };

  return (
    <span
      {...props}
      style={{
        ...props.style,
        display: "block",
        minHeight: "1.5em",
        padding: "0.2em",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        whiteSpace: "pre-wrap",
      }}
      ref={span}
      contentEditable={true}
      onBlur={handleBlur}
    />
  );
};

export default Input;
