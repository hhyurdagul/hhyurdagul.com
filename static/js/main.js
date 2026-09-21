// hhyurdagul.com — Interactive logic for 3-column editorial archetype

(function () {
  "use strict";

  // State
  window.appState = {
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    readingFont: document.documentElement.getAttribute("data-reading-font") || "serif",
    isMobileNavOpen: false,
    isMobileContextOpen: false
  };

  // 1. Theme Management
  window.toggleTheme = function () {
    var next = window.appState.theme === "dark" ? "light" : "dark";
    window.setTheme(next);
  };

  window.setTheme = function (mode) {
    window.appState.theme = mode;
    var html = document.documentElement;
    var gl = document.getElementById("giallo-light");
    var gd = document.getElementById("giallo-dark");
    if (mode === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
      if (gl) gl.disabled = true;
      if (gd) gd.disabled = false;
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
      if (gl) gl.disabled = false;
      if (gd) gd.disabled = true;
    }

    try {
      localStorage.setItem("theme", mode);
    } catch (_) {}
  };

  // 2. Reading Typography Toggle (Serif vs Sans)
  window.setReadingFont = function (font) {
    window.appState.readingFont = font;
    var body = document.getElementById("essayContentBody");
    var serifBtn = document.getElementById("fontSerifBtn");
    var sansBtn = document.getElementById("fontSansBtn");

    if (body) {
      if (font === "serif") {
        body.classList.remove("reading-font-sans");
        body.classList.add("reading-font-serif");
      } else {
        body.classList.remove("reading-font-serif");
        body.classList.add("reading-font-sans");
      }
    }

    if (serifBtn && sansBtn) {
      if (font === "serif") {
        serifBtn.className = "px-2 py-1 rounded text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-700 font-serif text-xs shadow-xs font-medium";
        sansBtn.className = "px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 font-sans text-xs hover:text-zinc-900 dark:hover:text-zinc-100";
      } else {
        sansBtn.className = "px-2 py-1 rounded text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-700 font-sans text-xs shadow-xs font-medium";
        serifBtn.className = "px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 font-serif text-xs hover:text-zinc-900 dark:hover:text-zinc-100";
      }
    }

    try {
      localStorage.setItem("readingFont", font);
    } catch (_) {}
  };

  // 3. Sidenotes / Marginal Notes
  window.focusSidenote = function (noteId) {
    var noteEl = document.getElementById(noteId);
    if (!noteEl) return;

    document.querySelectorAll(".sidenote-box").forEach(function (el) {
      el.classList.remove("sidenote-active");
    });

    noteEl.classList.add("sidenote-active");

    if (window.innerWidth < 1024) {
      window.toggleMobileContext(true);
      setTimeout(function () {
        noteEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } else {
      noteEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  window.highlightSidenote = function (noteId) {
    var noteEl = document.getElementById(noteId);
    if (!noteEl) return;

    document.querySelectorAll(".sidenote-box").forEach(function (el) {
      el.classList.remove("sidenote-active");
    });
    noteEl.classList.add("sidenote-active");
    window.toastMsg("Focused note reference");
  };

  function initSidenotes() {
    var noteDataElements = document.querySelectorAll(".sidenote-data");
    var notesList = document.getElementById("sidenotes-list");
    var notesContainer = document.getElementById("sidenotes-container");

    if (!notesList) return;

    if (!noteDataElements.length) {
      if (notesContainer) notesContainer.classList.add("hidden");
      return;
    }

    if (notesContainer) notesContainer.classList.remove("hidden");
    notesList.innerHTML = "";

    noteDataElements.forEach(function (el, index) {
      var id = el.getAttribute("data-id") || ("note-" + (index + 1));
      var body = el.innerHTML;

      var card = document.createElement("div");
      card.id = "note-" + id;
      card.className = "sidenote-box cursor-pointer p-3 rounded-xl border border-surface-light-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card transition-all duration-200 hover:border-accent-terra/50 text-xs";
      card.innerHTML =
        '<div class="flex items-center gap-1.5 font-mono text-accent-terra dark:text-amber-400 font-semibold mb-1">' +
          '<span>[' + (index + 1) + ']</span>' +
          '<span>Marginalia</span>' +
        '</div>' +
        '<div class="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">' + body + '</div>';

      card.addEventListener("click", function () {
        window.highlightSidenote("note-" + id);
      });

      notesList.appendChild(card);
    });
  }

  // 4. Table of Contents Scroll-Spy
  function initTOCScrollSpy() {
    var toc = document.getElementById("rightSidebarTOC");
    if (!toc) return;

    var links = Array.from(toc.querySelectorAll(".toc-link"));
    var sections = links.map(function (link) {
      var targetId = decodeURIComponent(link.getAttribute("href").replace(/^#/, ""));
      return { link: link, el: document.getElementById(targetId) };
    }).filter(function (s) { return s.el !== null; });

    if (!sections.length) return;

    function onScroll() {
      var scrollPos = window.scrollY + 140;
      var active = sections[0];

      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= scrollPos) {
          active = sections[i];
        }
      }

      links.forEach(function (l) {
        if (l === active.link) {
          l.classList.add("text-accent-terra", "dark:text-amber-400", "font-medium", "border-l-2", "border-accent-terra", "-ml-[13px]", "pl-[11px]");
          l.classList.remove("text-zinc-600", "dark:text-zinc-400");
        } else {
          l.classList.remove("text-accent-terra", "dark:text-amber-400", "font-medium", "border-l-2", "border-accent-terra", "-ml-[13px]", "pl-[11px]");
          l.classList.add("text-zinc-600", "dark:text-zinc-400");
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 5. Mobile Navigation & Context Drawer Controls
  function lockScroll(lock) {
    if (lock) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      if (!window.appState.isMobileNavOpen && !window.appState.isMobileContextOpen) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    }
  }

  window.toggleMobileNav = function (open) {
    if (typeof open !== "boolean") {
      open = !window.appState.isMobileNavOpen;
    }
    window.appState.isMobileNavOpen = open;
    var sheet = document.getElementById("leftSidebar");
    var backdrop = document.getElementById("mobileNavBackdrop");
    var toggleBtn = document.getElementById("mobileNavToggle");
    if (!sheet) return;

    if (open) {
      if (window.appState.isMobileContextOpen) window.toggleMobileContext(false);
      if (backdrop) backdrop.classList.remove("hidden");
      sheet.classList.add("is-open");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "true");
        var menuIcon = toggleBtn.querySelector(".icon-menu");
        var closeIcon = toggleBtn.querySelector(".icon-close");
        if (menuIcon) menuIcon.classList.add("hidden");
        if (closeIcon) closeIcon.classList.remove("hidden");
      }
      lockScroll(true);
      setTimeout(function () {
        sheet.focus();
      }, 50);
    } else {
      sheet.classList.remove("is-open");
      if (backdrop) backdrop.classList.add("hidden");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        var menuIcon = toggleBtn.querySelector(".icon-menu");
        var closeIcon = toggleBtn.querySelector(".icon-close");
        if (menuIcon) menuIcon.classList.remove("hidden");
        if (closeIcon) closeIcon.classList.add("hidden");
        toggleBtn.focus();
      }
      lockScroll(false);
    }
  };

  window.toggleMobileContext = function (open) {
    if (typeof open !== "boolean") {
      open = !window.appState.isMobileContextOpen;
    }
    window.appState.isMobileContextOpen = open;
    var sheet = document.getElementById("rightSidebar");
    var backdrop = document.getElementById("mobileContextBackdrop");
    var toggleBtn = document.getElementById("mobileContextToggle");
    var closeBtn = document.getElementById("mobileContextCloseBtn");
    if (!sheet) return;

    if (open) {
      if (window.appState.isMobileNavOpen) window.toggleMobileNav(false);
      if (backdrop) backdrop.classList.remove("hidden");
      sheet.classList.add("is-open");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
      lockScroll(true);
      setTimeout(function () {
        if (closeBtn) closeBtn.focus();
        else sheet.focus();
      }, 50);
    } else {
      sheet.classList.remove("is-open");
      if (backdrop) backdrop.classList.add("hidden");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.focus();
      }
      lockScroll(false);
    }
  };

  // 6. Utility Functions: Copy RSS, Current URL, Toast
  window.copyRSS = function (feedUrl) {
    copyTextToClipboard(feedUrl || (window.location.origin + "/rss.xml"), "RSS feed URL copied to clipboard");
  };

  window.copyAtom = function (feedUrl) {
    copyTextToClipboard(feedUrl || (window.location.origin + "/atom.xml"), "Atom feed URL copied to clipboard");
  };

  window.copyCurrentUrl = function () {
    copyTextToClipboard(window.location.href, "Citation link copied to clipboard");
  };

  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        window.toastMsg(successMsg);
      }).catch(function () {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    try {
      document.execCommand("copy");
      window.toastMsg(successMsg);
    } catch (_) {}
    document.body.removeChild(dummy);
  }

  window.toastMsg = function (msg) {
    var toast = document.getElementById("toast");
    var toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;

    toastMessage.textContent = msg;
    toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(function () {
      toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
      toast.classList.remove("translate-y-0", "opacity-100");
    }, 2600);
  };

  // 7. Code Copy Buttons
  function initCodeCopy() {
    document.querySelectorAll(".prose pre, pre.z-code").forEach(function (pre) {
      if (pre.closest(".code-block")) return;
      var code = pre.querySelector("code") || pre;
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
      btn.innerHTML =
        '<svg class="code-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>' +
        '<svg class="code-copy-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>' +
        '<span class="code-copy-label">Copy</span>';

      btn.addEventListener("click", function () {
        var text = code.innerText;
        copyTextToClipboard(text, "Code copied to clipboard");
        btn.classList.add("done");
        btn.querySelector(".code-copy-label").textContent = "Copied";
        setTimeout(function () {
          btn.classList.remove("done");
          btn.querySelector(".code-copy-label").textContent = "Copy";
        }, 1800);
      });

      header.appendChild(label);
      header.appendChild(btn);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });
  }

  // 8. Lifecycle Bootstrap
  document.addEventListener("DOMContentLoaded", function () {
    var mobileNavToggle = document.getElementById("mobileNavToggle");
    var mobileContextToggle = document.getElementById("mobileContextToggle");

    if (mobileNavToggle) {
      mobileNavToggle.addEventListener("click", function () {
        window.toggleMobileNav();
      });
    }

    if (mobileContextToggle) {
      mobileContextToggle.addEventListener("click", function () {
        window.toggleMobileContext();
      });
    }

    var navBackdrop = document.getElementById("mobileNavBackdrop");
    var contextBackdrop = document.getElementById("mobileContextBackdrop");
    var preventScroll = function (e) { e.preventDefault(); };
    if (navBackdrop) navBackdrop.addEventListener("touchmove", preventScroll, { passive: false });
    if (contextBackdrop) contextBackdrop.addEventListener("touchmove", preventScroll, { passive: false });

    // Auto-close mobile drawers when clicking navigation links or TOC anchors
    var leftSidebar = document.getElementById("leftSidebar");
    if (leftSidebar) {
      leftSidebar.addEventListener("click", function (e) {
        if (window.innerWidth < 1024 && e.target.closest("a")) {
          window.toggleMobileNav(false);
        }
      });
    }

    var rightSidebar = document.getElementById("rightSidebar");
    if (rightSidebar) {
      rightSidebar.addEventListener("click", function (e) {
        if (window.innerWidth < 1024 && e.target.closest("a[href^='#']")) {
          window.toggleMobileContext(false);
        }
      });
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) {
        if (window.appState.isMobileNavOpen) window.toggleMobileNav(false);
        if (window.appState.isMobileContextOpen) window.toggleMobileContext(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (window.appState.isMobileNavOpen) window.toggleMobileNav(false);
        if (window.appState.isMobileContextOpen) window.toggleMobileContext(false);
      }
    });

    // Initialize font mode
    var savedFont = null;
    try { savedFont = localStorage.getItem("readingFont"); } catch (_) {}
    window.setReadingFont(savedFont || "serif");

    // Initialize components
    initSidenotes();
    initTOCScrollSpy();
    initCodeCopy();
  });
})();
