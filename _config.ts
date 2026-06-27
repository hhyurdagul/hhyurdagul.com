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
    const tocPlaceholder = document.getElementById("toc-placeholder");

    if (articleContent && tocPlaceholder) {
      const headings = articleContent.querySelectorAll("h2, h3");
      if (headings.length === 0) {
        tocPlaceholder.remove();
        continue;
      }

      const tocNav = document.createElement("nav");
      tocNav.className = "toc-nav";
      
      const tocTitle = document.createElement("div");
      tocTitle.className = "toc-title";
      tocTitle.textContent = "Outline";
      tocNav.appendChild(tocTitle);

      const tocList = document.createElement("ul");
      tocList.className = "toc-list";

      headings.forEach((heading) => {
        const text = heading.textContent || "";
        const slug = heading.getAttribute("id") || text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, "");

        heading.setAttribute("id", slug);

        const tocItem = document.createElement("li");
        tocItem.className = `toc-item toc-${heading.tagName.toLowerCase()}`;

        const tocLink = document.createElement("a");
        tocLink.setAttribute("href", `#${slug}`);
        tocLink.textContent = text;

        tocItem.appendChild(tocLink);
        tocList.appendChild(tocItem);
      });

      tocNav.appendChild(tocList);
      tocPlaceholder.appendChild(tocNav);
    }
  }
});

export default site;
