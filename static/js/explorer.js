(() => {
  "use strict";

  // #directory is the page header (path, title); #reader is the content.
  // Both are swapped together; the window does the scrolling.
  const directory = document.getElementById("directory");
  const reader = document.getElementById("reader");
  if (!directory || !reader || !reader.querySelector("#content")) return;

  const stateKey = "__explorerNavigator";
  const positions = new Map();
  let sequence = 0;
  let revision = 0;
  let pending = null;
  let renderedURL = new URL(location.href);
  let settlingScroll = null;

  function sameDocument(left, right) {
    return left.origin === right.origin && left.pathname === right.pathname && left.search === right.search;
  }

  function position() {
    return { reader: window.scrollY, directory: directory.scrollTop };
  }

  function makeEntry(url, scroll = position()) {
    return { key: `${Date.now()}-${++sequence}`, url: url.href, ...scroll };
  }

  function entryFrom(state, url) {
    const entry = state?.[stateKey];
    return entry && typeof entry.key === "string" && entry.url === url.href
      && Number.isFinite(entry.reader) && Number.isFinite(entry.directory) ? entry : null;
  }

  function historyState(entry) {
    const state = history.state;
    return { ...(state && typeof state === "object" ? state : {}), [stateKey]: entry };
  }

  const initialEntry = entryFrom(history.state, renderedURL);
  let activeEntry = initialEntry || makeEntry(renderedURL);
  positions.set(activeEntry.key, { reader: activeEntry.reader, directory: activeEntry.directory });
  history.replaceState(historyState(activeEntry), "", renderedURL.href);
  history.scrollRestoration = "manual";

  // Keep positions, not page contents. During popstate the URL already belongs
  // to the destination, so the departing entry must not overwrite that state.
  function remember(persist = true) {
    const scroll = position();
    Object.assign(activeEntry, scroll);
    positions.set(activeEntry.key, scroll);
    if (persist && location.href === renderedURL.href
      && history.state?.[stateKey]?.key === activeEntry.key) {
      history.replaceState(historyState(activeEntry), "", renderedURL.href);
    }
  }

  function hashTarget(url) {
    if (!url.hash) return null;
    let id = url.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (_) { /* A literal malformed ID can still exist. */ }
    const target = document.getElementById(id);
    if (target && reader.contains(target)) return target;
    return Array.from(reader.querySelectorAll("a[name]")).find(anchor => anchor.getAttribute("name") === id) || null;
  }

  function focus(element) {
    if (!element) return;
    const temporary = !element.hasAttribute("tabindex")
      && !element.matches("a[href], button, input, select, textarea, summary");
    if (temporary) {
      element.setAttribute("tabindex", "-1");
      element.addEventListener("blur", () => element.removeAttribute("tabindex"), { once: true });
    }
    element.focus({ preventScroll: true });
  }

  function scrollToHash(url, fresh) {
    const target = hashTarget(url);
    if (target) {
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - margin);
    } else if (!url.hash || fresh || url.hash.toLowerCase() === "#top") {
      window.scrollTo(0, 0);
    }
    return target;
  }

  // Images can finish after a restored position was initially clamped to the
  // shorter document. Keep that position (or fragment) until the user acts.
  function settleScroll(saved, url = null) {
    settlingScroll = { saved: saved && { reader: saved.reader, directory: saved.directory }, url };
    if (saved) {
      window.scrollTo(0, saved.reader);
      directory.scrollTop = saved.directory;
    } else if (url) {
      scrollToHash(url, true);
    }
  }

  function syncDirectoryHash() {
    directory.querySelectorAll("a[href]").forEach(link => {
      const url = new URL(link.getAttribute("href"), renderedURL);
      if (!url.hash || !sameDocument(url, renderedURL)) return;
      if (url.hash === renderedURL.hash) link.setAttribute("aria-current", "location");
      else if (link.getAttribute("aria-current") === "location") link.removeAttribute("aria-current");
    });
  }

  function cancelPending() {
    revision += 1;
    pending?.abort();
    pending = null;
    settlingScroll = null;
  }

  function navigateHash(url, entry = null) {
    cancelPending();
    remember(!entry);
    const saved = entry && (positions.get(entry.key) || entry);
    if (entry) {
      activeEntry = entry;
    } else if (url.href !== location.href) {
      activeEntry = makeEntry(url);
      history.pushState(historyState(activeEntry), "", url.href);
    }
    renderedURL = url;
    const target = hashTarget(url);
    focus(target || reader.querySelector("#content"));
    if (saved) {
      settleScroll(saved);
    } else {
      if (target) settleScroll(null, url);
      else scrollToHash(url, false);
    }
    syncDirectoryHash();
    remember();
  }

  const metadataSelector = [
    'meta[name="description" i]',
    'meta[property^="og:" i]', 'meta[name^="og:" i]',
    'meta[name^="twitter:" i]', 'meta[property^="twitter:" i]',
    'meta[property^="article:" i]', 'meta[name^="article:" i]',
    'link[rel~="canonical" i]', 'script[type="application/ld+json" i]'
  ].join(",");

  function syncMetadata(page, url) {
    document.title = page.title;
    document.head.querySelectorAll(metadataSelector).forEach(node => node.remove());
    page.head.querySelectorAll(metadataSelector).forEach(source => {
      let node;
      if (source.tagName === "SCRIPT") {
        node = document.createElement("script");
        node.type = "application/ld+json";
        node.textContent = source.textContent;
      } else if (source.tagName === "LINK") {
        node = document.createElement("link");
        node.rel = "canonical";
        node.href = new URL(source.getAttribute("href"), url).href;
      } else {
        node = document.createElement("meta");
        for (const name of ["name", "property", "content"]) {
          if (source.hasAttribute(name)) node.setAttribute(name, source.getAttribute(name));
        }
      }
      document.head.append(node);
    });
  }

  function syncLocation(element, source) {
    for (const attribute of ["data-location", "data-level"]) {
      if (source.hasAttribute(attribute)) element.setAttribute(attribute, source.getAttribute(attribute));
      else element.removeAttribute(attribute);
    }
  }

  async function navigatePage(target, entry = null) {
    cancelPending();
    const request = revision;
    const controller = new AbortController();
    pending = controller;
    try {
      const response = await fetch(target.href, {
        signal: controller.signal,
        headers: { Accept: "text/html" }
      });
      if (!response.ok || !/^text\/html(?:\s*;|\s*$)/i.test(response.headers.get("Content-Type") || "")) {
        throw new Error("Not an HTML page");
      }
      const url = new URL(response.url);
      if (url.origin !== location.origin) throw new Error("Cross-origin redirect");
      if (!url.hash) url.hash = target.hash;
      const page = new DOMParser().parseFromString(await response.text(), "text/html");
      if (request !== revision) return;
      const nextDirectory = page.getElementById("directory");
      const nextReader = page.getElementById("reader");
      if (!nextDirectory || !nextReader?.querySelector("#content")
        || !page.body.hasAttribute("data-section")) throw new Error("Missing explorer markup");

      // Parsed page scripts are never evaluated or re-created as executable
      // scripts. Only inert JSON-LD from the head is copied by syncMetadata.
      nextDirectory.querySelectorAll("script").forEach(script => script.remove());
      nextReader.querySelectorAll("script").forEach(script => script.remove());
      const keepDirectory = directory.dataset.location === nextDirectory.dataset.location
        && directory.dataset.level === nextDirectory.dataset.level;
      const commit = () => {
        if (request !== revision) return;
        remember(!entry);
        const saved = entry && (positions.get(entry.key) || entry);
        const directoryTop = keepDirectory ? directory.scrollTop : 0;

        if (entry) {
          activeEntry = { ...entry, url: url.href };
          history.replaceState(historyState(activeEntry), "", url.href);
        } else {
          activeEntry = makeEntry(url, { reader: 0, directory: directoryTop });
          history.pushState(historyState(activeEntry), "", url.href);
        }
        renderedURL = url;
        // The response and required DOM are valid. Commit the URL before inserting
        // markup so relative image and link URLs resolve against the fetched page.
        directory.innerHTML = nextDirectory.innerHTML;
        reader.innerHTML = nextReader.innerHTML;
        syncLocation(directory, nextDirectory);
        syncLocation(reader, nextReader);
        document.body.dataset.section = page.body.dataset.section;
        syncMetadata(page, url);

        // Home has no reader; its heading is the content.
        focus(document.body.dataset.section === "home"
          ? directory.querySelector("h1") : reader.querySelector("#content"));
        directory.scrollTop = saved ? saved.directory : directoryTop;
        if (saved) settleScroll(saved);
        else if (url.hash) settleScroll(null, url);
        else window.scrollTo(0, 0);
        syncDirectoryHash();
        remember();
      };
      // Let the browser animate between the old and new layout when it can;
      // the swap itself is identical either way.
      if (typeof document.startViewTransition === "function"
        && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.startViewTransition(commit);
      } else {
        commit();
      }
    } catch (error) {
      if (request !== revision || controller.signal.aborted) return;
      // Do not manufacture a success state or hide a server's real error page.
      location.assign(target.href);
    } finally {
      if (request === revision) pending = null;
    }
  }

  function isHTMLLink(link, url) {
    if (url.origin !== location.origin || !["http:", "https:"].includes(url.protocol)) return false;
    if (link.hasAttribute("target") || link.hasAttribute("download")
      || link.relList.contains("external")) return false;
    const type = link.getAttribute("type");
    if (type && !/^text\/html(?:\s*;|\s*$)/i.test(type)) return false;
    let path = url.pathname;
    try { path = decodeURIComponent(path); } catch (_) { return false; }
    const last = path.replace(/\/+$/, "").split("/").pop();
    // Unknown files belong to the browser too, not just known images and feeds.
    return !last.includes(".") || /\.html?$/i.test(last);
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
      || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    const url = new URL(link.getAttribute("href"), renderedURL);
    if (!isHTMLLink(link, url)) return;
    // Let the browser handle text fragments and hashes outside the reading pane.
    if (url.hash.includes(":~:text=")) return;
    if (sameDocument(url, renderedURL) && url.hash && !hashTarget(url)
      && document.getElementById(url.hash.slice(1))) return;
    event.preventDefault();
    if (sameDocument(url, renderedURL)) navigateHash(url);
    else navigatePage(url);
  });

  window.addEventListener("popstate", event => {
    const url = new URL(location.href);
    const entry = entryFrom(event.state, url);
    if (sameDocument(url, renderedURL)) {
      if (entry) navigateHash(url, entry);
      else {
        // A manually entered fragment can create a native, unowned entry.
        remember(false);
        const nativeEntry = makeEntry(url);
        cancelPending();
        activeEntry = nativeEntry;
        renderedURL = url;
        history.replaceState(historyState(nativeEntry), "", url.href);
            focus(hashTarget(url) || reader.querySelector("#content"));
        scrollToHash(url, false);
        syncDirectoryHash();
        remember();
      }
    } else {
      remember(false);
      navigatePage(url, entry || makeEntry(url, { reader: 0, directory: 0 }));
    }
  });

  window.addEventListener("pagehide", () => remember());
  reader.addEventListener("load", event => {
    if (!(event.target instanceof HTMLImageElement) || !settlingScroll) return;
    const { saved, url } = settlingScroll;
    if (saved) {
      window.scrollTo(0, saved.reader);
      directory.scrollTop = saved.directory;
    } else {
      scrollToHash(url, true);
    }
    remember();
  }, true);
  for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    document.addEventListener(event, () => { settlingScroll = null; }, { capture: true, passive: true });
  }
  syncDirectoryHash();
  requestAnimationFrame(() => {
    if (revision !== 0) return;
    if (initialEntry) settleScroll({ reader: initialEntry.reader, directory: initialEntry.directory });
    else if (renderedURL.hash) settleScroll(null, renderedURL);
    remember();
  });
})();
