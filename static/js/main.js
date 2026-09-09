// Theme toggle, mobile sidebar, logo split, TOC, code copy. No search by design.
(function () {
  "use strict";

  // Split logo text into staggered spans (progressive enhancement).
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    Array.from(text).forEach(function (ch, i) {
      var s = document.createElement("span");
      s.style.setProperty("--i", String(i));
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    });
  });

  // Theme toggle.
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      var gl = document.getElementById("giallo-light"), gd = document.getElementById("giallo-dark");
      if (gl) gl.disabled = next === "dark";
      if (gd) gd.disabled = next !== "dark";
      try { localStorage.setItem("theme", next); } catch (_) {}
    });
  }

  // Mobile sidebar: lock the background, trap focus, return focus on close.
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var sidebarClose = document.getElementById("sidebar-close");
  var backdrop = document.getElementById("sidebar-backdrop");
  var main = document.querySelector("main.content");
  var mHeader = document.querySelector(".mobile-header");
  var lastFocus = null;
  function sidebarOpen() {
    return document.body.classList.contains("sidebar-open");
  }
  function focusables() {
    var sb = document.getElementById("sidebar");
    if (!sb) return [];
    return Array.prototype.filter.call(
      sb.querySelectorAll("a[href], button:not([disabled])"),
      function (el) { return el.offsetParent !== null; }
    );
  }
  function setSidebar(open) {
    var was = sidebarOpen();
    document.body.classList.toggle("sidebar-open", open);
    if (backdrop) backdrop.hidden = !open;
    if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", String(open));
    if (main) main.inert = open;
    if (mHeader) mHeader.inert = open;
    if (open && !was) {
      lastFocus = document.activeElement;
      if (sidebarClose) sidebarClose.focus();
    } else if (!open && was && lastFocus && lastFocus.focus) {
      lastFocus.focus();
      lastFocus = null;
    }
  }
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      setSidebar(!sidebarOpen());
    });
  }
  if (sidebarClose) {
    sidebarClose.addEventListener("click", function () { setSidebar(false); });
  }
  if (backdrop) backdrop.addEventListener("click", function () { setSidebar(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setSidebar(false); return; }
    if (e.key !== "Tab" || !sidebarOpen()) return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Floating TOC disclosure and a scroll marker that also tracks upward jumps.
  var tocToggle = document.getElementById("toc-toggle");
  var toc = document.getElementById("toc");
  if (tocToggle && toc) {
    var setTocOpen = function (open) {
      toc.classList.toggle("open", open);
      tocToggle.setAttribute("aria-expanded", String(open));
    };
    tocToggle.addEventListener("click", function () {
      setTocOpen(!toc.classList.contains("open"));
    });
    toc.addEventListener("click", function (event) {
      if (event.target.closest(".toc-link")) {
        setTocOpen(false);
      }
    });
    document.addEventListener("click", function (event) {
      if (!toc.contains(event.target) && !tocToggle.contains(event.target)) setTocOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toc.classList.contains("open")) {
        setTocOpen(false);
        tocToggle.focus();
      }
    });
  }
  if (toc) {
    var links = Array.from(toc.querySelectorAll(".toc-link"));
    var sections = links.map(function (link) {
      return { link: link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))) };
    }).filter(function (section) { return section.heading; });
    var indicator = toc.querySelector(".toc-indicator");
    var articleHeader = document.querySelector(".article-header");
    var updateToc = function () {
      if (!sections.length) return;
      var top = Math.max(64, articleHeader.getBoundingClientRect().bottom + 32);
      toc.style.setProperty("--toc-top", top + "px");
      var active = sections[0];
      sections.forEach(function (section) {
        if (section.heading.getBoundingClientRect().top <= 96) active = section;
      });
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        active = sections[sections.length - 1];
      }
      links.forEach(function (link) {
        link.classList.toggle("active", link === active.link);
        if (link === active.link) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (indicator) {
        var rect = active.link.getBoundingClientRect();
        indicator.style.transform = "translateY(" + (rect.top - toc.getBoundingClientRect().top + toc.scrollTop) + "px)";
        indicator.style.height = rect.height + "px";
      }
    };
    var tocFrame = null;
    var scheduleToc = function () {
      if (tocFrame !== null) return;
      tocFrame = window.requestAnimationFrame(function () {
        tocFrame = null;
        updateToc();
      });
    };
    window.addEventListener("scroll", scheduleToc, { passive: true });
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 1280px)").matches && tocToggle) {
        setTocOpen(false);
      }
      scheduleToc();
    });
    window.addEventListener("hashchange", scheduleToc);
    window.addEventListener("load", scheduleToc);
    if (document.fonts) document.fonts.ready.then(scheduleToc);
    updateToc();
  }

  // Code copy buttons for fenced blocks with a language header.
  document.querySelectorAll(".prose pre").forEach(function (pre) {
    var code = pre.querySelector("code");
    if (!code) return;
    var wrapper = document.createElement("div");
    wrapper.className = "code-block";
    var header = document.createElement("div");
    header.className = "code-block-header";
    var langName = code.getAttribute("data-lang") || "code";
    Array.from(code.classList).forEach(function (c) {
      if (c.indexOf("language-") === 0) langName = c.slice("language-".length);
    });
    var label = document.createElement("span");
    label.className = "code-block-lang";
    label.textContent = langName;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = '<span class="code-copy-icon">⧉</span><span class="code-copy-label">Copy</span>';
    btn.addEventListener("click", function () {
      var done = function () {
        btn.classList.add("done");
        btn.querySelector(".code-copy-label").textContent = "Copied";
        setTimeout(function () {
          btn.classList.remove("done");
          btn.querySelector(".code-copy-label").textContent = "Copy";
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code.innerText).then(done, done);
      } else { done(); }
    });
    header.appendChild(label);
    header.appendChild(btn);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });

  // Fade margin sidenotes sliding beneath the sticky TOC (wide screens only).
  // Opacity preserves geometry, so no fade/unfade oscillation at the boundary.
  var tocNav = document.getElementById("toc");
  var wideQuery = window.matchMedia("(min-width: 1280px)");
  if (tocNav && "getBoundingClientRect" in tocNav) {
    var notes = Array.from(document.querySelectorAll(".article .sidenote"));
    var fadeNotes = function () {
      notes.forEach(function (n) {
        if (!wideQuery.matches) { n.classList.remove("note-dimmed"); return; }
        var t = tocNav.getBoundingClientRect();
        var r = n.getBoundingClientRect();
        var overlap = r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top;
        n.classList.toggle("note-dimmed", overlap);
      });
    };
    window.addEventListener("scroll", fadeNotes, { passive: true });
    window.addEventListener("resize", fadeNotes);
    fadeNotes();
  }
})();
