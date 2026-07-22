import { FC, useEffect, useMemo, useRef, useState } from "react";

import { defaultData, Props } from "./types";

const HEIGHT_MSG_TYPE = "tabliss-html-widget-height";

/**
 * srcdoc document for JS mode. Runs in a sandboxed iframe (no same-origin)
 * so Chromium MV3 / Firefox extension CSP still allows user scripts.
 */
function buildSrcDoc(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    color: #fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }
  a { color: inherit; }
</style>
<script>
(function () {
  function report() {
    try {
      var h = Math.max(
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.scrollHeight : 0
      );
      parent.postMessage({ type: "${HEIGHT_MSG_TYPE}", height: h }, "*");
    } catch (e) {}
  }
  window.addEventListener("load", report);
  window.addEventListener("DOMContentLoaded", function () {
    report();
    if (typeof ResizeObserver !== "undefined" && document.documentElement) {
      new ResizeObserver(report).observe(document.documentElement);
      if (document.body) new ResizeObserver(report).observe(document.body);
    }
  });
  setTimeout(report, 50);
  setTimeout(report, 300);
})();
</script>
</head>
<body>
${html}
</body>
</html>`;
}

const Html: FC<Props> = ({ data = defaultData }) => {
  const allowJavaScript = Boolean(data.allowJavaScript);
  const input = data.input || "";
  const staticHtml = useMemo(() => ({ __html: input }), [input]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(80);

  // Auto-height from sandboxed iframe (no same-origin access).
  useEffect(() => {
    if (!allowJavaScript) return;

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
  }, [allowJavaScript]);

  if (allowJavaScript) {
    return (
      <iframe
        ref={iframeRef}
        className="Html Html-frame"
        title="Custom HTML"
        sandbox="allow-scripts allow-popups allow-forms allow-modals"
        srcDoc={buildSrcDoc(input)}
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
