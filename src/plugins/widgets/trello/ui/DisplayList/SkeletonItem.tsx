import React from "react";

interface SkeletonItemProps {
  width: number;
  height: number;
}

export default function SkeletonItem({ width, height }: SkeletonItemProps) {
  return (
    <div
      className="display-list-item-content"
      style={{
        visibility: "hidden",
        pointerEvents: "none",
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}
