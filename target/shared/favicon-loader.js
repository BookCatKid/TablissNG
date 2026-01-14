/**
 * Early Favicon Loader
 *
 * Checks localStorage for a custom favicon and applies it immediately
 * to prevent flickering. Extracted to an external file to comply with
 * strict Content Security Policies (CSP) that block inline scripts.
 */
(function() {
  let href = "icons/128.png";
  const custom = localStorage.getItem('tabliss/favicon');
  if (custom) {
    href = custom;
  }

  const link = document.getElementById('tabliss-favicon');
  if (link) {
    link.href = href;
  }
})();
