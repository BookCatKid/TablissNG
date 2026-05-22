import "./RichTextEditor.sass";

import { Icon } from "@iconify/react";
import DOMPurify from "dompurify";
import React from "react";

import { sanitizeRichText, sanitizeRichTextNode } from "../../utils/richText";

type RichTextEditorProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

const fontFamilies = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace", value: "'JetBrains Mono', 'Fira Code', monospace" },
  { label: "Display", value: "'Bebas Neue', 'Impact', sans-serif" },
];

const fontSizes = [12, 16, 20, 24, 32];

const emojiPalette = [
  "😀",
  "😊",
  "✨",
  "🔥",
  "🌟",
  "❤️",
  "👍",
  "🙏",
  "🎯",
  "📌",
  "💡",
  "✅",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const lastRenderedValue = React.useRef("");
  const [selectionAnchor, setSelectionAnchor] = React.useState<Range | null>(
    null,
  );

  const replaceEditorContent = React.useCallback(
    (element: HTMLDivElement, nextValue: string) => {
      const sanitized = sanitizeRichText(nextValue);
      const fragment = DOMPurify.sanitize(sanitized, {
        RETURN_DOM_FRAGMENT: true,
      }) as DocumentFragment;

      element.replaceChildren(fragment);
      lastRenderedValue.current = sanitized;
    },
    [],
  );

  React.useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const sanitized = sanitizeRichText(value || "");

    if (lastRenderedValue.current !== sanitized) {
      replaceEditorContent(editorRef.current, sanitized);
    }
  }, [value, replaceEditorContent]);

  const emitChange = () => {
    if (!editorRef.current) return;

    const sanitized = sanitizeRichTextNode(editorRef.current);
    lastRenderedValue.current = sanitized;
    onChange(sanitized);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectionAnchor(selection.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (!selectionAnchor) {
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(selectionAnchor);
  };

  const exec = (command: string, valueArg?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, valueArg);
    emitChange();
  };

  const applyStyle = (style: Partial<CSSStyleDeclaration>) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      editorRef.current.focus();
      return;
    }

    const wrapper = document.createElement("span");

    Object.entries(style).forEach(([key, val]) => {
      if (val) {
        // @ts-expect-error - dynamic style assignment
        wrapper.style[key] = val;
      }
    });

    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);

    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);

    emitChange();
  };

  const handleInput = () => {
    emitChange();
  };

  const handleEmojiInsert = (emoji: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand("insertText", false, emoji);
    emitChange();
  };

  return (
    <div className="RichTextEditor">
      <div className="toolbar" role="toolbar" aria-label="Formatting options">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("bold")}
          title="Bold"
        >
          <Icon icon="mdi:format-bold" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("italic")}
          title="Italic"
        >
          <Icon icon="mdi:format-italic" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("underline")}
          title="Underline"
        >
          <Icon icon="mdi:format-underline" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
        >
          <Icon icon="mdi:format-strikethrough" />
        </button>

        <div className="toolbar-divider" />

        <select
          aria-label="Font family"
          onMouseDown={saveSelection}
          onChange={(event) => {
            restoreSelection();
            const nextValue = event.target.value;

            if (!nextValue) {
              exec("removeFormat");
            } else {
              applyStyle({ fontFamily: nextValue });
            }

            event.target.value = "";
          }}
        >
          <option value="">Font</option>
          {fontFamilies.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Font size"
          onMouseDown={saveSelection}
          onChange={(event) => {
            restoreSelection();
            const size = Number(event.target.value);

            if (!size) {
              exec("removeFormat");
            } else {
              applyStyle({ fontSize: `${size}px` });
            }

            event.target.value = "";
          }}
        >
          <option value="">Size</option>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        <div className="toolbar-divider" />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("justifyLeft")}
          title="Align left"
        >
          <Icon icon="mdi:format-align-left" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("justifyCenter")}
          title="Align center"
        >
          <Icon icon="mdi:format-align-center" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("justifyRight")}
          title="Align right"
        >
          <Icon icon="mdi:format-align-right" />
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          title="Bullet list"
        >
          <Icon icon="mdi:format-list-bulleted" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          title="Numbered list"
        >
          <Icon icon="mdi:format-list-numbered" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("indent")}
          title="Indent"
        >
          <Icon icon="mdi:format-indent-increase" />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("outdent")}
          title="Outdent"
        >
          <Icon icon="mdi:format-indent-decrease" />
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("removeFormat")}
          title="Clear formatting"
        >
          <Icon icon="mdi:eraser" />
        </button>

        <div className="toolbar-divider" />

        <div className="emoji-picker" aria-label="Insert emoji">
          <button type="button" onMouseDown={(event) => event.preventDefault()}>
            <Icon icon="mdi:emoticon-happy-outline" />
          </button>

          <div className="emoji-list">
            {emojiPalette.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleEmojiInsert(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="editor-surface"
        ref={editorRef}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={saveSelection}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
