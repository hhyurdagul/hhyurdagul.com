(() => {
  "use strict";

  const root = document.documentElement;
  const button = document.getElementById("appearance-toggle");
  const system = matchMedia("(prefers-color-scheme: dark)");

  function sync() {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : system.matches;
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    const background = getComputedStyle(root).backgroundColor;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = background;
    });
  }

  button.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : system.matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
    sync();
  });

  system.addEventListener("change", sync);
  sync();
  button.hidden = false;
})();
