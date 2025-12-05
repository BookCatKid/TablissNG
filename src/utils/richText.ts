const allowedTags = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "SPAN",
  "DIV",
  "P",
  "BR",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "CODE",
  "PRE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
]);

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

const sanitizeStyle = (styleValue: string) => {
  const declarations = styleValue.split(";").map((item) => item.trim()).filter(Boolean);
  const safeDeclarations = declarations.filter((declaration) => {
    const [property] = declaration.split(":");
    return property && allowedStyles.includes(property.trim().toLowerCase());
  });
  return safeDeclarations.join("; ");
};

const sanitizeNode = (node: Node) => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    if (!allowedTags.has(element.tagName)) {
      const parent = element.parentNode;
      if (!parent) {
        element.remove();
      } else {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      }
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name === "style") {
        const safeStyle = sanitizeStyle(attribute.value);
        if (safeStyle) {
          element.setAttribute("style", safeStyle);
        } else {
          element.removeAttribute("style");
        }
      } else if (attribute.name === "title") {
        // allow title for accessibility
      } else {
        element.removeAttribute(attribute.name);
      }
    });
  }

  Array.from(node.childNodes).forEach(sanitizeNode);
};

export const sanitizeRichText = (value: string): string => {
  if (typeof document === "undefined") {
    return value;
  }
  const template = document.createElement("template");
  template.innerHTML = value ?? "";
  sanitizeNode(template.content);
  return template.innerHTML;
};

export const stripRichText = (value: string): string => {
  if (typeof document === "undefined") {
    return value;
  }
  const div = document.createElement("div");
  div.innerHTML = value ?? "";
  return div.textContent || "";
};
