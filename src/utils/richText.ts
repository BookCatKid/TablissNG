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

const richTextSanitizeConfig = {
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: ["style", "title"],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

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

const escapeText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttribute = (value: string) =>
  escapeText(value).replace(/"/g, "&quot;");

const serializeNode = (node: ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeText(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const attributes = Array.from(element.attributes)
    .map(({ name, value }) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");

  if (tagName === "br") {
    return `<${tagName}${attributes}>`;
  }

  const children = Array.from(element.childNodes).map(serializeNode).join("");
  return `<${tagName}${attributes}>${children}</${tagName}>`;
};

const serializeChildren = (node: ParentNode): string =>
  Array.from(node.childNodes).map(serializeNode).join("");

export const sanitizeRichText = (value?: string): string => {
  if (typeof window === "undefined") {
    return value ?? "";
  }

  configurePurifier();

  return DOMPurify.sanitize(value ?? "", richTextSanitizeConfig);
};

export const sanitizeRichTextNode = (value?: Node | null): string => {
  if (typeof window === "undefined" || !value) {
    return "";
  }

  configurePurifier();

  const fragment = DOMPurify.sanitize(value, {
    ...richTextSanitizeConfig,
    RETURN_DOM_FRAGMENT: true,
  }) as DocumentFragment;

  return serializeChildren(fragment);
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
