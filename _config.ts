import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";
import metas from "lume/plugins/metas.ts";
import katex from "lume/plugins/katex.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import seo from "lume/plugins/seo.ts";
import feed from "lume/plugins/feed.ts";
import validateHTML from "lume/plugins/validate_html.ts";
import shiki from "https://deno.land/x/lume_shiki/mod.ts";


const site = lume({
  location: new URL("https://hhyurdagul.com"),
});

site.use(basePath())
site.use(robots())
site.use(sitemap())
site.use(metas())
site.use(checkUrls())
site.use(seo())
site.use(validateHTML())
site.use(feed({
  query: "type=article",
  info: {
    title: "HHYurdagul's RSS Feed"
  }
}))
site.use(katex({
  cssFile: "/css/katex.css"
}))
site.use(googleFonts({
  cssFile: "/css/fonts.css",
  fonts: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
}))

// --- Custom Component Style Extractor Plugin ---
site.process([".html", ".css"], (pages) => {
  const uniqueStyles = new Set<string>();

  // 1. Extract styles from HTML pages
  for (const page of pages) {
    if (page.outputPath?.endsWith(".html")) {
      const document = page.document;
      if (!document) continue;

      const componentStyles = document.querySelectorAll("style[component]");
      if (componentStyles.length === 0) continue;

      componentStyles.forEach((styleEl: any) => {
        uniqueStyles.add(styleEl.textContent);
        styleEl.remove(); // Remove from the page body
      });
    }
  }

  // 2. Append consolidated styles to the global style.css page
  if (uniqueStyles.size > 0) {
    const bundleCss = Array.from(uniqueStyles).join("\n");
    const stylePage = pages.find((p) => p.outputPath === "/style.css" || p.data.url === "/style.css");
    if (stylePage) {
      stylePage.content += "\n" + bundleCss;
    } else {
      console.warn("Global style.css page not found in Lume build!");
    }
  }
});

site.use(lightningCss())

site.use(shiki({
  highlighter: {
    langs: ["javascript", "toml", "html", "python"],
    themes: ["tokyo-night"]
  },
  theme: "tokyo-night",
}))

site.add("_includes/CNAME")
site.add("_includes/style.css")
site.add("_includes/pages", "/")
site.add("_includes/assets")
site.add([".jpeg", ".jpg", ".png", ".svg", ".mp3", ".mp4"])

site.data("layout", "layouts/layout.vto")

function formatDate(date: Date): string {

  // Extract the exact day and year using UTC methods to avoid timezone shifts
  const day: number = date.getUTCDate();
  const year: number = date.getUTCFullYear();

  // Get the full month name natively
  const month: string = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

  // Construct and return the final string
  return `${day} ${month}, ${year}`;
}

export function getReadingTime(content: string, wordsPerMinute: number = 225): string {
  // Handle empty or whitespace-only strings
  if (!content || content.trim().length === 0) {
    return 0;
  }

  // Split the content by any whitespace character to get the word array
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;

  // Calculate the reading time and round up to the nearest whole minute
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  if (readingTime === 0) return "0 min read";
  if (readingTime === 1) return "1 min read";
  
  return `${readingTime} min read`;
}


site.helper("formatDate", formatDate, {type: "tag"})
site.helper("extractReadingTime", getReadingTime, {type: "tag"})

site.process([".html"], (pages) => {
  for (const page of pages) {
    if (page.data.type !== "article") continue;
    
    const document = page.document;
    if (!document) continue;

    const articleContent = document.querySelector(".article-content");
    
    if (articleContent) {
      // 1. Convert paragraphs containing footnote references to <div class="article-paragraph">
      const paragraphs = Array.from(articleContent.querySelectorAll("p"));
      paragraphs.forEach((p: any) => {
        const text = p.textContent ? p.textContent.trim() : "";
        if (text.includes("[^") && !text.match(/^\[\^([^\]]+)\]:\s*/)) {
          const div = document.createElement("div");
          div.className = "article-paragraph";
          div.innerHTML = p.innerHTML;
          for (const attr of p.attributes) {
            div.setAttribute(attr.name, attr.value);
          }
          p.parentNode.replaceChild(div, p);
        }
      });

      // 2. Sidenotes extraction
      const notesMap = new Map();
      const remainingParagraphs = Array.from(articleContent.querySelectorAll("p"));
      remainingParagraphs.forEach((p: any) => {
        const text = p.textContent ? p.textContent.trim() : "";
        const match = text.match(/^\[\^([^\]]+)\]:\s*(.*)/s);
        if (match) {
          const id = match[1];
          notesMap.set(id, p.innerHTML.replace(/^\[\^[^\]]+\]:\s*/, ""));
          p.remove();
        }
      });

      if (notesMap.size > 0) {
        const textNodes: any[] = [];
        const walk = (node: any) => {
          if (node.nodeType === 3) { // TEXT_NODE
            if (node.nodeValue && node.nodeValue.includes("[^")) {
              textNodes.push(node);
            }
          } else {
            for (let child = node.firstChild; child; child = child.nextSibling) {
              if (
                child.nodeName === "PRE" ||
                child.nodeName === "CODE" ||
                child.nodeName === "SCRIPT" ||
                child.nodeName === "STYLE" ||
                child.nodeName === "DETAILS"
              ) {
                continue;
              }
              walk(child);
            }
          }
        };
        walk(articleContent);

        textNodes.forEach((textNode: any) => {
          const text = textNode.nodeValue;
          const parent = textNode.parentNode;
          if (!parent) return;

          const regex = /\[\^([^\]]+)\]/g;
          let match;
          let lastIndex = 0;
          const nodes: any[] = [];

          while ((match = regex.exec(text)) !== null) {
            const id = match[1];
            if (notesMap.has(id)) {
              if (match.index > lastIndex) {
                nodes.push(document.createTextNode(text.substring(lastIndex, match.index)));
              }

              const wrapper = document.createElement("span");
              wrapper.className = "sidenote-wrapper";

              const details = document.createElement("details");
              details.className = "sidenote-container";

              const summary = document.createElement("summary");
              summary.className = "sidenote-ref";
              summary.setAttribute("data-id", id);
              details.appendChild(summary);

              const sidenote = document.createElement("span");
              sidenote.className = "sidenote";
              sidenote.innerHTML = notesMap.get(id);

              wrapper.appendChild(details);
              wrapper.appendChild(sidenote);

              nodes.push(wrapper);
              lastIndex = regex.lastIndex;
            }
          }

          if (lastIndex > 0) {
            if (lastIndex < text.length) {
              nodes.push(document.createTextNode(text.substring(lastIndex)));
            }
            nodes.forEach(node => {
              parent.insertBefore(node, textNode);
            });
            parent.removeChild(textNode);
          }
        });
      }
    }

    const tocContainer = document.getElementById("toc-container");

    if (articleContent && tocContainer) {
      const headings = articleContent.querySelectorAll("h2, h3");
      const title = tocContainer.getAttribute("data-title") || "";
      
      const tocNav = document.createElement("nav");
      tocNav.className = "toc-nav";

      // 1. "ON THIS PAGE" header
      const tocHeader = document.createElement("div");
      tocHeader.className = "toc-header-title";
      tocHeader.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-meta-icon"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        <span>ON THIS PAGE</span>
      `;
      tocNav.appendChild(tocHeader);

      const tocList = document.createElement("ul");
      tocList.className = "toc-list";

      // 2. Article Title (Root item with orange dot)
      const rootItem = document.createElement("li");
      rootItem.className = "toc-item toc-root active";
      
      const rootDot = document.createElement("span");
      rootDot.className = "toc-dot root-dot";
      rootItem.appendChild(rootDot);

      const rootLink = document.createElement("a");
      rootLink.setAttribute("href", "#");
      rootLink.textContent = title;
      rootItem.appendChild(rootLink);
      tocList.appendChild(rootItem);

      // 3. Subheadings
      if (headings.length > 0) {
        const subListWrapper = document.createElement("div");
        subListWrapper.className = "toc-sublist-wrapper";
        
        headings.forEach((heading) => {
          const text = heading.textContent || "";
          const slug = heading.getAttribute("id") || text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/^-+|-+$/g, "");

          heading.setAttribute("id", slug);

          const tocItem = document.createElement("div");
          tocItem.className = `toc-subitem toc-${heading.tagName.toLowerCase()}`;

          const dot = document.createElement("span");
          dot.className = "toc-subdot";
          tocItem.appendChild(dot);

          const tocLink = document.createElement("a");
          tocLink.setAttribute("href", `#${slug}`);
          tocLink.textContent = text;

          tocItem.appendChild(tocLink);
          subListWrapper.appendChild(tocItem);
        });

        tocList.appendChild(subListWrapper);
      }

      tocNav.appendChild(tocList);
      tocContainer.appendChild(tocNav);
    }
  }
});

export default site;
