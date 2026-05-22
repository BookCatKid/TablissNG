import DOMPurify from "dompurify";

const allowedTags = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "span",
  "div",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

const allowedStyles = [
  "text-align",
  "font-weight",
  "font-style",
  "text-decoration",
  "font-size",
  "font-family",
  "margin-left",
  "padding-left",
  "color",
  "background-color",
  "line-height",
];

let purifierConfigured = false;

const sanitizeStyle = (styleValue: string) => {
  const declarations = styleValue
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  const safeDeclarations = declarations.filter((declaration) => {
    const [property] = declaration.split(":");
    return property && allowedStyles.includes(property.trim().toLowerCase());
  });

  return safeDeclarations.join("; ");
};

const configurePurifier = () => {
  if (purifierConfigured) return;

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "style") {
      data.attrValue = sanitizeStyle(data.attrValue);
    }
  });

  purifierConfigured = true;
};

export const sanitizeRichText = (value?: string): string => {
  if (typeof window === "undefined") {
    return value ?? "";
  }

  configurePurifier();

  return DOMPurify.sanitize(value ?? "", {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["style", "title"],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
};

export const stripRichText = (value?: string): string => {
  if (typeof window === "undefined") {
    return value ?? "";
  }

  configurePurifier();

  return DOMPurify.sanitize(value ?? "", {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};
