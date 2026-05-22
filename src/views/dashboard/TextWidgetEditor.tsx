import React from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { useIntl } from "react-intl";
import { UiContext } from "../../contexts/ui";
import { getConfig } from "../../plugins";
import { useApi } from "../../hooks";
import { sanitizeRichText, stripRichText } from "../../utils/richText";
import {
  MessageData,
  defaultData as defaultMessageData,
} from "../../plugins/widgets/message/types";
import {
  CustomTextData,
  defaultData as defaultCustomTextData,
} from "../../plugins/widgets/customText/types";
import {
  Data as NotesData,
  defaultData as defaultNotesData,
} from "../../plugins/widgets/notes/data";
import RichTextEditor from "./RichTextEditor";
import "./TextWidgetEditor.sass";

const TextWidgetEditor: React.FC = () => {
  const { textEditorTarget } = React.useContext(UiContext);
  if (!textEditorTarget || typeof document === "undefined") {
    return null;
  }
  return createPortal(<EditorSurface target={textEditorTarget} />, document.body);
};

type EditorSurfaceProps = {
  target: { widgetId: string; widgetKey: string };
};

const TextWidgetKeys = {
  MESSAGE: "widget/message",
  NOTES: "widget/notes",
  CUSTOM_TEXT: "widget/customText",
};

const EditorSurface: React.FC<EditorSurfaceProps> = ({ target }) => {
  const intl = useIntl();
  const { closeTextEditor, setHotkeysPaused } = React.useContext(UiContext);
  const { data, setData } = useApi(target.widgetId);

  if (
    target.widgetKey !== TextWidgetKeys.MESSAGE &&
    target.widgetKey !== TextWidgetKeys.NOTES &&
    target.widgetKey !== TextWidgetKeys.CUSTOM_TEXT
  ) {
    return null;
  }
  const config = getConfig(target.widgetKey);
  const widgetName = intl.formatMessage(config.name);

  const [messageValue, setMessageValue] = React.useState("");
  const [notesValue, setNotesValue] = React.useState("");
  const [notesMarkdown, setNotesMarkdown] = React.useState(false);
  const [customEntries, setCustomEntries] = React.useState<string[]>([""]);
  const [activeEntry, setActiveEntry] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setIsReady(false);
  }, [target.widgetKey]);

  React.useEffect(() => {
    const ensureMessageData = (): MessageData =>
      ((data as MessageData | undefined) ?? defaultMessageData);
    const ensureNotesData = (): NotesData =>
      ((data as NotesData | undefined) ?? defaultNotesData);
    const ensureCustomTextData = (): CustomTextData =>
      ((data as CustomTextData | undefined) ?? defaultCustomTextData);

    if (target.widgetKey === TextWidgetKeys.MESSAGE) {
      const messageData = ensureMessageData();
      setMessageValue(messageData?.messages?.[0] ?? "");
      setIsReady(true);
      return;
    }

    if (target.widgetKey === TextWidgetKeys.NOTES) {
      const notesData = ensureNotesData();
      const current = notesData?.notes?.[0]?.contents ?? "";
      setNotesValue(current);
      setNotesMarkdown(Boolean(notesData?.markdownEnabled));
      setIsReady(true);
      return;
    }

    if (target.widgetKey === TextWidgetKeys.CUSTOM_TEXT) {
      const dataset = ensureCustomTextData();
      let entries: string[] = [];
      if (Array.isArray(dataset?.strings) && dataset.strings.length > 0) {
        entries = [...dataset.strings];
      } else if (dataset?.text) {
        const sep = dataset.atNewline ? "\n" : dataset.separator || "\n";
        entries = dataset.text.split(sep).filter(Boolean);
      } else {
        entries = [""];
      }
      setCustomEntries(entries.length ? entries : [""]);
      setActiveEntry(0);
      setIsReady(true);
    }
  }, [data, target.widgetKey]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTextEditor();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTextEditor]);

  React.useEffect(() => {
    setHotkeysPaused(true);
    return () => setHotkeysPaused(false);
  }, [setHotkeysPaused]);

  const handleSave = () => {
    const asMessage = (data as MessageData | undefined) ?? defaultMessageData;
    const asNotes = (data as NotesData | undefined) ?? defaultNotesData;
    const asCustom = (data as CustomTextData | undefined) ?? defaultCustomTextData;
    if (target.widgetKey === TextWidgetKeys.MESSAGE) {
      const sanitized = sanitizeRichText(messageValue);
      setData({
        ...asMessage,
        messages: [sanitized],
        richTextEnabled: true,
      });
    } else if (target.widgetKey === TextWidgetKeys.NOTES) {
      const sanitized = sanitizeRichText(notesValue);
      setData({
        ...asNotes,
        notes: [{ contents: sanitized }],
        richTextEnabled: true,
        markdownEnabled: false,
      });
    } else if (target.widgetKey === TextWidgetKeys.CUSTOM_TEXT) {
      const sanitizedEntries = customEntries.map((entry) => sanitizeRichText(entry));
      setData({
        ...asCustom,
        strings: sanitizedEntries,
        richTextEnabled: true,
        text: sanitizedEntries.map((entry) => stripRichText(entry)).join("\n"),
        atNewline: true,
        separator: "\n",
      });
    }
    closeTextEditor();
  };

  const renderMessageEditor = () => (
    <div className="editor-section">
      <p className="helper-text">Add emphasis, lists, and emojis to your widget text.</p>
      <RichTextEditor value={messageValue} onChange={setMessageValue} placeholder="Start typing..." />
    </div>
  );

  const renderNotesEditor = () => (
    <div className="editor-section">
      {notesMarkdown ? (
        <div className="warning-card">
          <Icon icon="feather:info" />
          <span>
            Rich text editing will disable Markdown formatting for this note. Saving will convert it to
            rich text automatically.
          </span>
        </div>
      ) : null}
      <RichTextEditor value={notesValue} onChange={setNotesValue} placeholder="Document your thoughts..." />
    </div>
  );

  const updateEntry = (index: number, value: string) => {
    setCustomEntries((prev) => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const addEntry = () => {
    setCustomEntries((prev) => {
      const next = [...prev, ""];
      setActiveEntry(next.length - 1);
      return next;
    });
  };

  const removeEntry = (index: number) => {
    setCustomEntries((prev) => {
      if (prev.length === 1) {
        setActiveEntry(0);
        return [""];
      }
      const next = prev.filter((_, idx) => idx !== index);
      const ensured = next.length ? next : [""];
      setActiveEntry((current) => Math.max(0, Math.min(current, ensured.length - 1)));
      return ensured;
    });
  };

  const renderCustomTextEditor = () => (
    <div className="custom-text-layout">
      <div className="entry-sidebar">
        {customEntries.map((_, index) => (
          <button
            key={`entry-${index}`}
            type="button"
            className={index === activeEntry ? "active" : ""}
            onClick={() => setActiveEntry(index)}
          >
            Snippet {index + 1}
          </button>
        ))}
        <button type="button" className="ghost" onClick={addEntry}>
          <Icon icon="feather:plus" /> Add snippet
        </button>
        <p className="sidebar-hint">
          Snippets rotate based on your existing timing settings.
        </p>
      </div>
      <div className="entry-editor">
        <RichTextEditor
          value={customEntries[activeEntry] ?? ""}
          onChange={(next) => updateEntry(activeEntry, next)}
          placeholder="Write the snippet content..."
        />
        <div className="entry-actions">
          <button
            type="button"
            className="danger"
            onClick={() => removeEntry(activeEntry)}
            disabled={customEntries.length === 1}
          >
            <Icon icon="feather:trash-2" /> Remove snippet
          </button>
        </div>
      </div>
    </div>
  );

  const renderBody = () => {
    if (target.widgetKey === TextWidgetKeys.MESSAGE) {
      return renderMessageEditor();
    }
    if (target.widgetKey === TextWidgetKeys.NOTES) {
      return renderNotesEditor();
    }
    if (target.widgetKey === TextWidgetKeys.CUSTOM_TEXT) {
      return renderCustomTextEditor();
    }
    return null;
  };

  return (
    <>
      <div className="text-widget-editor-backdrop" onClick={closeTextEditor} />
      <div className="TextWidgetEditor" role="dialog" aria-modal="true">
        <div className="editor-header">
          <h3>
            <Icon icon="feather:type" aria-hidden="true" />
            <span>{widgetName}</span>
          </h3>
          <button
            type="button"
            className="close-btn"
            aria-label="Close text editor"
            onClick={closeTextEditor}
          >
            <Icon icon="feather:x" />
          </button>
        </div>

        <div className="editor-content" data-scroll>
          {isReady ? renderBody() : <p className="helper-text">Loading widget data…</p>}
        </div>

        <div className="editor-footer">
          <button type="button" className="ghost" onClick={closeTextEditor}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleSave} disabled={!isReady}>
            Save changes
          </button>
        </div>
      </div>
    </>
  );
};

export default TextWidgetEditor;
