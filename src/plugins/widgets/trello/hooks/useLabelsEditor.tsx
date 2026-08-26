import { useEffect, useRef, useState } from "react";

export function useLabelsEditor(
  selfRef: React.RefObject<HTMLDivElement | null>,
) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Set tag position when opened to align next to card
  useEffect(() => {
    if (isEditing && selfRef.current) {
      const r = selfRef.current.getBoundingClientRect();
      setPosition({ top: r.top, left: r.right + 8 });
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const updatePosition = () => {
      if (selfRef.current) {
        const r = selfRef.current.getBoundingClientRect();
        setPosition({ top: r.top, left: r.right + 8 });
      }
    };
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isEditing]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target as Node) &&
        selfRef.current &&
        !selfRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditing]);

  return {
    portalRef,
    isEditing,
    setIsEditing,
    position,
  };
}
