import type { FC } from "react";
import { useMemo } from "react";

interface CustomSvgProps {
  svgString: string;
  width: number;
  height: number;
  conserveAspectRatio?: boolean;
  className?: string;
}

const blockedElements = new Set(["foreignobject", "script"]);

const sanitizeAttributes = (element: Element): void => {
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value.trim();

    if (
      name.startsWith("on") ||
      /(?:javascript:|data\s*:\s*text\/html)/i.test(value)
    ) {
      element.removeAttribute(attribute.name);
    }
  }
};

const sanitizeSvg = (svg: SVGElement): void => {
  sanitizeAttributes(svg);

  for (const element of Array.from(svg.querySelectorAll("*"))) {
    const name = element.localName.toLowerCase();
    if (blockedElements.has(name)) {
      element.remove();
      continue;
    }

    sanitizeAttributes(element);
  }
};

const parseSvg = (
  svgString: string,
  width: number,
  height: number,
  conserveAspectRatio?: boolean,
): string | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) return null;
    const svg = doc.querySelector("svg");
    if (!svg) return null;

    sanitizeSvg(svg);

    svg.setAttribute("width", `${width}`);
    if (!conserveAspectRatio) {
      svg.setAttribute("height", `${height}`);
      svg.setAttribute("preserveAspectRatio", "none");
    } else {
      svg.removeAttribute("height");
      svg.removeAttribute("preserveAspectRatio");
    }

    return svg.outerHTML;
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
    <span
      className={`Link-icon ${className ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: parsedSvg }}
    />
  );
};
