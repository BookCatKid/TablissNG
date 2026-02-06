import React, { FC } from "react";

interface CustomImageProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
}

export const CustomImage: FC<CustomImageProps> = ({
  src,
  alt,
  width,
  height,
  conserveAspectRatio,
}) => {
  return (
    <span className="Link-icon">
      <img
        src={src}
        alt={alt}
        style={{
          width: `${width}px`,
          height: conserveAspectRatio ? "auto" : `${height}px`,
          display: "inline-block",
        }}
      />
    </span>
  );
};
