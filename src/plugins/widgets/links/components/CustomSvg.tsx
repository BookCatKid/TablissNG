import React, { FC, useMemo } from "react";

interface CustomSvgProps {
  svgString: string;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
  className?: string;
}

const parseSvg = (
  svgString: string,
  width: number,
  height: number,
  conserveAspectRatio?: boolean,
) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return null;

    svg.setAttribute("width", `${width}`);
    if (!conserveAspectRatio) {
      svg.setAttribute("height", `${height}`);
    } else {
      svg.removeAttribute("height");
    }

    return <span dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />;
  } catch {
    return null;
  }
};

export const CustomSvg: FC<CustomSvgProps> = ({
  svgString,
  width,
  height,
  conserveAspectRatio,
  className,
}) => {
  const parsedSvg = useMemo(
    () => parseSvg(svgString, width, height, conserveAspectRatio),
    [svgString, width, height, conserveAspectRatio],
  );

  if (!parsedSvg) return null;

  return (
    <span className={`Link-icon ${className ?? ""}`.trim()}>{parsedSvg}</span>
  );
};
