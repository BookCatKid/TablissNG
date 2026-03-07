import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type PopoverContextValue = {
  open: boolean;
  toggle: () => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);
const usePopover = () => useContext(PopoverContext)!;

const Popover = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, toggle: () => setOpen((p) => !p) }}>
      <div
        ref={popoverRef}
        style={{ position: "relative", display: "inline-block" }}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({ children }: PropsWithChildren) => {
  const { toggle } = usePopover();
  return <button onClick={toggle}>{children}</button>;
};

const PopoverContent = ({ children }: PropsWithChildren) => {
  const { open } = usePopover();
  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "150%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverContent, PopoverTrigger };
