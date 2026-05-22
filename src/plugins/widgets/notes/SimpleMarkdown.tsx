import { type FC, useMemo } from "react";

function parseMarkdown(src: string): string {
  // Escape HTML
  let html = src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre><code>${code.replace(/\n$/, "")}</code></pre>`;
  });

  // Split into blocks by double newlines or block-level boundaries (but not inside <pre>)
  const blocks: string[] = [];
  let current = "";
  const lines = html.split("\n");
  let inPre = false;

  const isBlockStart = (line: string): boolean =>
    /^#{1,6}\s/.test(line) ||
    line.startsWith("&gt; ") ||
    /^[-*]\s/.test(line) ||
    /^\d+\.\s/.test(line) ||
    /^([-*_]){3,}\s*$/.test(line.trim());

  for (const line of lines) {
    if (line.includes("<pre>")) inPre = true;
    if (line.includes("</pre>")) {
      inPre = false;
      current += line + "\n";
      continue;
    }
    if (inPre) {
      current += line + "\n";
      continue;
    }
    if (line.trim() === "" && current.trim() !== "") {
      blocks.push(current.trimEnd());
      current = "";
    } else if (
      isBlockStart(line) &&
      current.trim() !== "" &&
      !isBlockStart(current.split("\n")[0])
    ) {
      blocks.push(current.trimEnd());
      current = line + "\n";
    } else {
      current += line + "\n";
    }
  }
  if (current.trim()) blocks.push(current.trimEnd());

  const sanitizeUrl = (url: string): string => {
    try {
      const parsed = new URL(url, window.location.origin);
      if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
        return parsed.href;
      }
      return "";
    } catch {
      return url.startsWith("/") ? url : "";
    }
  };

  const inlineFormat = (text: string): string => {
    return (
      text
        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
          const safeSrc = sanitizeUrl(src);
          return safeSrc ? `<img src="${safeSrc}" alt="${alt}" />` : alt || "";
        })
        // Bold + italic
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
          const safeHref = sanitizeUrl(href);
          return safeHref
            ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`
            : label;
        })
    );
  };

  const processBlock = (block: string): string => {
    // Already processed code blocks
    if (block.includes("<pre>")) return block;

    // Headings
    const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      return `<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`;
    }

    // Blockquote
    if (block.startsWith("&gt; ")) {
      const content = block
        .split("\n")
        .map((l) => l.replace(/^&gt;\s?/, ""))
        .join("\n");
      return `<blockquote>${inlineFormat(content)}</blockquote>`;
    }

    // Unordered list
    if (/^[-*]\s/.test(block)) {
      const items = block
        .split("\n")
        .filter((l) => /^[-*]\s/.test(l))
        .map((l) => `<li>${inlineFormat(l.replace(/^[-*]\s+/, ""))}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }

    // Ordered list
    if (/^\d+\.\s/.test(block)) {
      const items = block
        .split("\n")
        .filter((l) => /^\d+\.\s/.test(l))
        .map((l) => `<li>${inlineFormat(l.replace(/^\d+\.\s+/, ""))}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }

    // Horizontal rule
    if (/^([-*_]){3,}\s*$/.test(block.trim())) {
      return "<hr />";
    }

    // Paragraph
    return `<p>${inlineFormat(block)}</p>`;
  };

  return blocks.map(processBlock).join("\n");
}

const SimpleMarkdown: FC<{ children: string }> = ({ children }) => {
  const html = useMemo(() => parseMarkdown(children), [children]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default SimpleMarkdown;
