import { FC, useEffect, useMemo, useRef, useState } from "react";

import { defaultData, Props } from "./types";

const RENDER_MSG_TYPE = "tabliss-html-widget-render";
const HEIGHT_MSG_TYPE = "tabliss-html-widget-height";

const Html: FC<Props> = ({ data = defaultData }) => {
  const input = data.input || "";
  const staticHtml = useMemo(() => ({ __html: input }), [input]);
  // Web keeps the legacy in-page injection (not sandboxed). Sandboxed JS is
  // an extension-only opt-in using a declared sandbox page to bypass extension CSP restrictions.
  const useSandbox = BUILD_TARGET !== "web" && Boolean(data.allowJavaScript);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(80);

  const sendContent = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: RENDER_MSG_TYPE, html: input },
        "*",
      );
    }
  };

  // Send content to sandboxed iframe whenever input changes
  useEffect(() => {
    if (!useSandbox) return;
    sendContent();
    const timer = setTimeout(sendContent, 100);
    return () => clearTimeout(timer);
  }, [useSandbox, input]);

  // Auto-height from sandboxed iframe
  useEffect(() => {
    if (!useSandbox) return;

    const onMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (
        !payload ||
        typeof payload !== "object" ||
        payload.type !== HEIGHT_MSG_TYPE
      ) {
        return;
      }
      // Only accept messages from our iframe window.
      if (
        iframeRef.current &&
        event.source &&
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }
      const height = Number(payload.height);
      if (Number.isFinite(height) && height > 0) {
        setFrameHeight(Math.ceil(height));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [useSandbox]);

  if (useSandbox) {
    return (
      <iframe
        ref={iframeRef}
        className="Html Html-frame"
        title="Custom HTML"
        src="sandbox.html"
        onLoad={sendContent}
        style={{
          border: 0,
          width: "100%",
          height: frameHeight,
          display: "block",
          background: "transparent",
          overflow: "hidden",
        }}
      />
    );
  }

  return <div className="Html" dangerouslySetInnerHTML={staticHtml} />;
};

export default Html;
