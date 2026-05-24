import "./CustomCodeEditor.sass";

import { Icon } from "@iconify/react";
import React from "react";
import { createPortal } from "react-dom";
import { useIntl } from "react-intl";

import { UiContext } from "../../contexts/ui";
import { useApi } from "../../hooks";
import { getConfig } from "../../plugins";
import {
  CodeLanguage,
  getCodeLanguageForWidget,
  isCustomCodeWidget,
} from "../../plugins/widgets/customCode";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightCode = (code: string, language: CodeLanguage) => {
  const escaped = escapeHtml(code);
  if (language === "css") {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
      .replace(
        /([#.][a-zA-Z0-9_-]+)(?=\s*\{)/g,
        '<span class="token selector">$1</span>',
      )
      .replace(/([a-z-]+)(?=\s*:)/g, '<span class="token property">$1</span>')
      .replace(/(:\s*)([^;]+)(?=;)/g, '$1<span class="token value">$2</span>');
  }
  if (language === "html") {
    return escaped.replace(
      /(&lt;\/?)([a-zA-Z0-9:-]+)([^&]*?)(\/?>)/g,
      (_match, open, tag, attrs, close) => {
        const attrMarkup = attrs.replace(
          /([a-zA-Z-:]+)(=)(".*?"|'.*?'|[^\s"'>]+)/g,
          '<span class="token attr-name">$1</span>$2<span class="token attr-value">$3</span>',
        );
        return `${open}<span class="token tag">${tag}</span>${attrMarkup}${close}`;
      },
    );
  }
  return escaped
    .replace(/(\/\/.*?$)/gm, '<span class="token comment">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
    .replace(
      /(".*?"|'.*?'|`[\s\S]*?`)/g,
      '<span class="token string">$1</span>',
    )
    .replace(
      /\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|await|async|try|catch|throw|switch|case|break|continue)\b/g,
      '<span class="token keyword">$1</span>',
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="token number">$1</span>');
};

const CustomCodeEditor: React.FC = () => {
  const { codeEditorTarget } = React.useContext(UiContext);
  if (!codeEditorTarget || !isCustomCodeWidget(codeEditorTarget.widgetKey)) {
    return null;
  }
  return (
    <EditorInstance key={codeEditorTarget.widgetId} target={codeEditorTarget} />
  );
};

type EditorInstanceProps = {
  target: { widgetId: string; widgetKey: string };
};

const EditorInstance: React.FC<EditorInstanceProps> = ({ target }) => {
  const { closeCodeEditor } = React.useContext(UiContext);
  const intl = useIntl();
  const config = getConfig(target.widgetKey);
  const language = getCodeLanguageForWidget(target.widgetKey);
  const { data, setData } = useApi(target.widgetId, {});
  const [code, setCode] = React.useState(() => {
    if (data && typeof data === "object" && "input" in data) {
      return (data as { input?: string }).input ?? "";
    }
    return "";
  });

  const initialCodeRef = React.useRef(code);

  React.useEffect(() => {
    if (data && typeof data === "object" && "input" in data) {
      const nextValue = (data as { input?: string }).input ?? "";
      setCode(nextValue);
      initialCodeRef.current = nextValue;
    }
  }, [data, target.widgetId]);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightRef = React.useRef<HTMLPreElement>(null);
  const lineNumberRef = React.useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (!textareaRef.current) {
      return;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = React.useCallback(() => {
    const nextData = data && typeof data === "object" ? { ...data } : {};
    setData({ ...nextData, input: code });
    initialCodeRef.current = code;
    closeCodeEditor();
  }, [code, data, closeCodeEditor, setData]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCodeEditor();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCodeEditor, handleSave]);

  if (!language || typeof document === "undefined") {
    return null;
  }

  const highlighted = highlightCode(code, language);
  const highlightedMarkup =
    (highlighted || "&nbsp;") +
    (code.endsWith("\n") ? '<span class="line-placeholder">&nbsp;</span>' : "");
  const lines = code.split("\n");
  const isDirty = code !== initialCodeRef.current;
  const widgetName = intl.formatMessage(config.name);

  return createPortal(
    <>
      <div className="custom-code-editor-backdrop" onClick={closeCodeEditor} />
      <div className="CustomCodeEditor" role="dialog" aria-modal="true">
        <div className="editor-header">
          <div className="title-block">
            <Icon icon="feather:code" aria-hidden="true" />
            <div>
              <h3>{widgetName}</h3>
              <p>{language.toUpperCase()} editor</p>
            </div>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost" onClick={closeCodeEditor}>
              Close
            </button>
            <button
              type="button"
              className="primary"
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save &amp; Apply
            </button>
          </div>
        </div>

        <div className="editor-body">
          <div className="code-shell">
            <div
              className="line-numbers"
              ref={lineNumberRef}
              aria-hidden="true"
            >
              {lines.map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <div className="code-pane">
              <pre
                className="highlight"
                aria-hidden="true"
                ref={highlightRef}
                dangerouslySetInnerHTML={{ __html: highlightedMarkup }}
              />
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onScroll={syncScroll}
                spellCheck={false}
                autoFocus
                aria-label={`${widgetName} code`}
              />
            </div>
          </div>

          <div className="editor-hints">
            <Icon icon="feather:info" aria-hidden="true" />
            <p>
              Press <kbd>Ctrl</kbd> + <kbd>S</kbd> (or <kbd>⌘</kbd> +{" "}
              <kbd>S</kbd>) to save instantly. Use this editor for advanced
              tweaks—changes apply immediately across devices.
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default CustomCodeEditor;
