import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import katex from "lume/plugins/katex.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import shiki from "https://deno.land/x/lume_shiki/mod.ts";
import lightningCss from "lume/plugins/lightningcss.ts";

// import lang_python from "npm:highlight.js/lib/languages/python";

const site = lume({
  location: new URL("https://hhyurdagul.com"),
});

site.use(basePath())
site.use(robots())
site.use(sitemap())
site.use(katex({
  cssFile: "/css/katex.css"
}))
site.use(googleFonts({
  cssFile: "/css/fonts.css",
  fonts: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
}))

site.use(
  shiki({
    cssFile: false,
    highlighter: {
      langs: ["javascript", "toml", "html", "python"],
      themes: ["tokyo-night"]
    },
    theme: "tokyo-night",
  }),
)

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

site.add("style.css")
site.add("_includes/assets")
site.add([".jpeg", ".jpg", ".png", ".svg", ".mp3", ".mp4"])

site.data("layout", "layout.vto")

export default site;
