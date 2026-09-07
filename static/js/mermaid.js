// Mermaid diagrams: render fenced mermaid blocks, lazily loading the library.
// Runs before main.js (script order) so code-copy skips converted blocks.
// Without JS or CDN access the raw code block remains readable.
(function () {
  "use strict";
  var blocks = document.querySelectorAll('.prose pre code[data-lang="mermaid"]');
  if (!blocks.length) return;
  Array.prototype.forEach.call(blocks, function (code) {
    var pre = code.closest("pre");
    if (!pre) return;
    var div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent;
    pre.replaceWith(div);
  });
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.min.js";
  s.onload = function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    window.mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default" });
    if (window.mermaid.run) {
      try {
        var r = window.mermaid.run({ querySelector: ".mermaid" });
        if (r && r.catch) r.catch(function () {});
      } catch (_) {}
    }
  };
  document.head.appendChild(s);
})();
