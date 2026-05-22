import "./Select.sass";

import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  values: SelectOption[];
  onChange: (values: SelectOption[]) => void;
  searchable?: boolean;
  placeholder?: string;
  dropdownHeight?: string;
  style?: CSSProperties;
  contentRenderer?: (values: SelectOption[]) => ReactNode;
}

const Select: FC<Props> = ({
  options,
  values,
  onChange,
  searchable = true,
  placeholder = "Select...",
  dropdownHeight = "300px",
  style,
  contentRenderer,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSelected = useCallback(
    (option: SelectOption) => values.some((v) => v.value === option.value),
    [values],
  );

  const toggleItem = useCallback(
    (option: SelectOption) => {
      if (isSelected(option)) {
        onChange(values.filter((v) => v.value !== option.value));
      } else {
        onChange([...values, option]);
      }
    },
    [values, onChange, isSelected],
  );

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  // Scroll active item into view
  useEffect(() => {
    if (cursor !== null && dropdownRef.current) {
      const item = dropdownRef.current.children[cursor] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [cursor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setCursor(0);
        return;
      }
      setCursor((prev) =>
        prev === null || prev >= filtered.length - 1 ? 0 : prev + 1,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setCursor((prev) =>
        prev === null || prev <= 0 ? filtered.length - 1 : prev - 1,
      );
      return;
    }

    if (e.key === "Enter" && open && cursor !== null) {
      e.preventDefault();
      const item = filtered[cursor];
      if (item) toggleItem(item);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`multiselect${open ? " multiselect--open" : ""}`}
      style={style}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (!open) setOpen(true);
      }}
    >
      <div className="multiselect__content">
        {contentRenderer ? (
          contentRenderer(values)
        ) : values.length === 0 ? (
          <span className="multiselect__placeholder">{placeholder}</span>
        ) : (
          <div className="multiselect__tags">
            {values.map((v) => (
              <span key={v.value} className="multiselect__tag">
                {v.label}
              </span>
            ))}
          </div>
        )}
        {searchable && open && (
          <input
            ref={inputRef}
            className="multiselect__input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(null);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div
        className="multiselect__handle"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
          if (open) setSearch("");
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.5 6l3.5 4 3.5-4z" />
        </svg>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="multiselect__dropdown"
          style={{ maxHeight: dropdownHeight }}
        >
          {filtered.length === 0 ? (
            <div className="multiselect__no-data">No results</div>
          ) : (
            filtered.map((option, i) => (
              <div
                key={option.value}
                className={`multiselect__item${isSelected(option) ? " multiselect__item--selected" : ""}${cursor === i ? " multiselect__item--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(option);
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
