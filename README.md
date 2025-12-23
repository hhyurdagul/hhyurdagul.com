# Personal site (Soupault)

This repository is a small static website built with **Soupault**.

- Source files live in `site/`
- The page template (layout + global CSS) lives in `templates/main.html`
- Soupault generates the final site into `build/`

This README explains how each part works and what you can customize.

---

## Cheat sheet

### Most common commands

- Build everything: `soupault --force`
- Preview locally: `python3 -m http.server -d build 8000`

### Most common edits

- Change layout / global CSS: `templates/main.html`
- Add/edit pages and posts: `site/`
- Change site-wide behavior (SEO, math, highlighting, sitemap): `soupault.toml`
- Tweak custom logic:
  - SEO: `plugins/seo-meta.lua`
  - KaTeX CSS injection: `plugins/katex-assets.lua`
  - Highlight CSS injection: `plugins/highlight-assets.lua`

---

## Quick start

### Build

```sh
soupault --force
```

### Preview locally

```sh
python3 -m http.server -d build 8000
```

Open `http://localhost:8000`.

---

## Requirements

This project assumes the following tools are available:

- `soupault` (tested with `5.2.0`)
- `katex` CLI (used for build-time math rendering)
- `highlight` CLI (used for build-time syntax highlighting)

Notes:

- KaTeX is **not** run in the browser. The HTML is rendered during the build.
- Syntax highlighting is **not** run in the browser. Code blocks are converted to highlighted HTML during the build.

---

## Project layout

### Input (what you edit)

- `templates/main.html`
  - Site-wide HTML shell (head, header, nav, footer)
  - Global CSS (color palette, typography, components)

- `site/`
  - Everything in here is either a **page** (processed) or a **static asset** (copied as-is).
  - Pages:
    - HTML bodies: `site/**/*.html`
    - Markdown pages: `site/**/*.md` (Soupault built-in CommonMark)
  - Assets:
    - Anything that is *not* a page extension is copied unchanged into `build/`

- `plugins/`
  - Small Lua widgets that Soupault loads automatically (`plugin_discovery = true`).

### Output (generated)

- `build/`
  - The final, ready-to-deploy website.
  - Do not edit by hand (changes will be overwritten by the next build).

---

## Core Soupault configuration (`soupault.toml`)

### Generator mode + content insertion

This site uses Soupault’s **website generator** mode:

- `settings.generator_mode = true`
- `settings.default_template_file = "templates/main.html"`
- `settings.default_content_selector = "main#content"`
- `settings.default_content_action = "replace_content"`

Meaning:

1. Soupault loads `templates/main.html`.
2. For each page file in `site/`, Soupault inserts that page’s body into `<main id="content">`.
3. Widgets/plugins run and can modify the DOM.
4. Soupault writes HTML into `build/`.

### Clean URLs

`settings.clean_urls = true` produces URLs like:

- `/writing/order-cancellations/` instead of `/writing/order-cancellations.html`

Internally that means:

- `site/writing/order-cancellations.html` → `build/writing/order-cancellations/index.html`

---

## Pages: HTML vs Markdown

### HTML pages

HTML pages in `site/` are treated as **HTML fragments** (page bodies).

Example:

- `site/writing/fault-prediction.html`

Should *not* include `<html>`, `<head>`, or `<body>`.

### Markdown pages

Markdown pages are enabled via:

- `settings.markdown_extensions = ["md"]`

Example:

- `site/writing/posts/hello-soupault.md`

Soupault converts Markdown to HTML and then inserts it into the template.

Tip: Soupault’s Markdown supports raw HTML blocks. That’s used for features like math wrappers.

---

## SEO (titles, descriptions, canonicals, OG/Twitter)

SEO is handled by a custom plugin:

- `plugins/seo-meta.lua`

Enabled in:

- `[widgets.seo-meta]` in `soupault.toml`

### What it sets

For each page, it sets/updates:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- OpenGraph:
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:image`
- Twitter:
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### How it chooses title and description

- Title: first non-empty of `main#content h1`, then `h2`, then `h3`
- Description: first non-empty of:
  - `main#content .intro-text`
  - `main#content p`
  - `main#content li`

Practical guidance:

- Always include a single, clear `<h1>` in post-like pages.
- Put a short summary in the first paragraph (ideally `.intro-text`) to get a good meta description.

### Canonical URLs

The canonical URL is based on:

- `site_url` configured in `[widgets.seo-meta]`

Make sure it matches your real domain, including the correct `www` vs non-`www` choice.

### OpenGraph image

The social preview image defaults to the icon you already ship:

- `og_image = "/web-app-manifest-512x512.png"`

You can replace it with a dedicated banner (recommended) later.

---

## Sitemap generation (automatic)

`build/sitemap.xml` is generated at build time by a Soupault **post-build hook**:

- `[hooks.post-build]` in `soupault.toml`

How it works:

- It collects URLs from `site_index` (Soupault’s index of pages)
- It also explicitly adds:
  - `/`
  - `/writing/`
  - `/projects/`
- It deduplicates and sorts them
- It writes `build/sitemap.xml`

This means you do **not** manually edit sitemap URLs anymore.

---

## Auto index pages (Writing / Projects)

The `/writing` and `/projects` pages are **auto-generated indexes**.

- You keep a small hand-written shell page:
  - `site/writing/index.html` contains `<div id="writing-index">...</div>`
  - `site/projects/index.html` contains `<div id="projects-index">...</div>`
- Soupault fills those containers using index views configured in `soupault.toml`:
  - `index.views.writing` (lists everything under `site/writing/`, including `posts/`)
  - `index.views.projects` (lists everything under `site/projects/`)

Index data comes from selectors in `index.fields`:

- `title`: `main#content h1`
- `excerpt`: `main#content p.intro-text` (or first paragraph)
- `date`: `time.post-date` `datetime` attribute (for sorting)
- `date_display`: `time.post-date` text (for display)
- `showcase`: `.showcase` `data-showcase` attribute (for homepage featured lists)

To add a new post/project, you usually just add the page file and rebuild.

### Homepage lists (Showcased only)

The homepage also uses index views to populate these sections automatically:

- `Latest Writing` → `<div id="home-writing-index">` (configured by `index.views.home-writing`)
- `Featured Projects` → `<div id="home-projects-index">` (configured by `index.views.home-projects`)

Only pages that contain the showcase marker are rendered.

Add this anywhere in the page body:

```html
<span class="showcase" data-showcase="1"></span>
```

This marker is hidden by CSS (see `.showcase` in `templates/main.html`).

---

## Navigation active link

The navigation highlighting is handled by:

- `plugins/nav-active.lua`

It adds:

- `class="active"`
- `aria-current="page"`

To the matching `<nav>` link based on the current page URL.

---

## “Prose” typography for posts/projects

Longform pages (writing posts and project pages) get a different typography treatment.

That is done by adding a `prose` class to the `<body>` of those pages:

- `plugins/add_class.lua` (a tiny helper widget)
- Configured by:
  - `[widgets.prose-writing]`
  - `[widgets.prose-projects]`

Then CSS in `templates/main.html` applies different rules when `body.prose` is present.

If you want to expand the prose styling (e.g. better blockquotes, tables, etc.), do it in `templates/main.html` under the `body.prose` rules.

---

## Math rendering (KaTeX, build-time)

Math is rendered during the build using the globally installed `katex` CLI.

### How to write math

Use HTML wrappers in Markdown or HTML pages:

- Inline math:

```html
<span class="inline-math">a+b=20</span>
```

- Display math:

```html
<div class="display-math">\int_0^\infty x^2\,dx</div>
```

### How it works

Soupault widgets:

- `[widgets.inline-math]` runs `katex` on `.inline-math`
- `[widgets.display-math]` runs `katex --display-mode` on `.display-math`

They use `widget = "preprocess_element"` so the element content is piped to `katex` via stdin and replaced with KaTeX HTML.

### KaTeX assets (CSS + fonts)

KaTeX CSS and fonts are stored locally:

- `site/assets/katex/katex.min.css`
- `site/assets/katex/fonts/*`

They are copied to `build/` as static assets.

### Conditional loading (important)

KaTeX CSS is only injected on pages that contain math.

This is handled by:

- `plugins/katex-assets.lua`

It looks for `.inline-math`, `.display-math`, `.katex`, or `.katex-display`, and only then injects:

```html
<link rel="stylesheet" href="/assets/katex/katex.min.css">
```

---

## Syntax highlighting (highlight, build-time)

Syntax highlighting is performed during the build using Andre Simon’s `highlight` CLI.

### How to write code blocks

In Markdown:

```md
```python
def hello():
    return "hi"
```
```

Soupault produces:

```html
<pre><code class="language-python">...</code></pre>
```

### How it works

Widget:

- `[widgets.highlight]` uses `preprocess_element`
- It targets:
  - `pre > code[class*='language-']`
- It extracts the language from `$ATTR_CLASS` and passes it to `highlight --syntax=...`.
- It replaces the code element content with the highlighted HTML fragment.

### Highlight CSS

Highlight emits token classes like:

- `.hl.kwa` (keyword)
- `.hl.sng` (string)
- `.hl.com` (comment)

CSS for those classes is served from:

- `site/assets/highlight/highlight.css`

Backup of a previous custom theme is kept at:

- `site/assets/highlight/highlight.custom.css`

### Conditional loading

Highlight CSS is only injected on pages that contain highlighted output.

- `plugins/highlight-assets.lua` looks for `.hl` and injects:

```html
<link rel="stylesheet" href="/assets/highlight/highlight.css">
```

---

## Favicons / web manifest

Favicon and PWA-ish assets live in `site/` and are referenced in `templates/main.html`:

- `favicon.svg`, `favicon.ico`
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`
- `apple-touch-icon.png`
- `site.webmanifest`
- `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`

They are copied into `build/` as-is.

If you add more icon sizes, add more `<link rel="icon" ...>` tags in `templates/main.html`.

---

## Common customizations

### Change site colors

Edit CSS variables in:

- `templates/main.html` under `:root` and `@media (prefers-color-scheme: dark)`

### Add a new page

Create a new file in `site/`:

- `site/about.html` (HTML fragment)

Link to it in `templates/main.html` nav:

```html
<a href="/about">About</a>
```

Then rebuild.

### Add a new Markdown post

Create:

- `site/writing/posts/my-post.md`

Recommended content structure:

- Optional back link block (raw HTML is OK in Soupault Markdown)
- Optional showcase marker (only needed if you want it featured on the homepage):
  - `<span class="showcase" data-showcase="1"></span>`
- A `<time class="post-date" datetime="YYYY-MM-DD">YYYY</time>` (used for sorting in the writing index)
- A single `# Title` (used for SEO title + index title)
- A strong first paragraph (used for SEO description and excerpts)

You do **not** need to edit `site/writing/index.html`.
It auto-lists all pages under `site/writing/` (including `site/writing/posts/*.md`) via `index.views.writing` in `soupault.toml`.

Then rebuild.

### Change the SEO defaults

Edit:

- `[widgets.seo-meta]` in `soupault.toml`

Common things to set:

- `site_url`
- `site_name`
- `title_suffix`
- `og_image`

---

## Deployment

Any static hosting works as long as it serves `build/`.

Typical flows:

- GitHub Pages: deploy `build/` to `gh-pages` branch (or an actions workflow)
- Netlify/Vercel/Cloudflare Pages: build command `soupault --force`, publish directory `build`

---

## Troubleshooting

### KaTeX output renders but looks unstyled

- Make sure the page contains the injected CSS link (only added when math is present).
- Ensure `site/assets/katex/katex.min.css` and `site/assets/katex/fonts/` exist.

### Highlighting doesn’t run

- Ensure the code block has a language class, e.g. `language-python`.
- Ensure `highlight` is installed and available on PATH.

### Clean URLs not working as expected

- Confirm `settings.clean_urls = true`.
- Remember that `site/foo.html` becomes `build/foo/index.html` and is served at `/foo/`.
