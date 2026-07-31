(function () {
  var HEIGHT_MSG_TYPE = "tabliss-html-widget-height";

  function report() {
    try {
      var h = Math.max(
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.scrollHeight : 0
      );
      parent.postMessage({ type: HEIGHT_MSG_TYPE, height: h }, "*");
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

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (data && typeof data === "object" && data.type === "tabliss-html-widget-render") {
      document.open();
      document.write(data.html || "");
      document.close();
      setTimeout(report, 50);
      setTimeout(report, 300);
    }
  });
})();
