# hhyurdagul.com

Personal site, built with [Zola](https://www.getzola.org/). Hand-written CSS,
self-hosted fonts, no third-party requests. JavaScript is optional: an inline
theme toggle and a small progressive router (`static/js/explorer.js`).

## Develop

```sh
nix develop            # shell with the pinned zola (0.22.x, same as CI)
zola serve             # http://127.0.0.1:1111
zola check             # build + link check
```

## Layout

- `templates/` — Tera templates. `base.html` holds one centred column on
  every page, with no navigation bar:
  - **Header (`#directory`)**: the header of the current location
    (`partials/directory.html`, rows in `macros/directory.html`). It starts
    with a path such as `hhyurdagul / projects / teus` whose segments climb
    back out, then the title, summary, facts and a collapsed Contents list.
    Home is this header alone: introduction, projects and writing.
  - **Content (`#reader`)**: follows the header. Everything, images included,
    stays within the text column (`--measure`). Project cards (home strip and
    Projects grid) show each screenshot as a window on the same mat: tall
    captures hang from the top and run off the bottom edge, wide ones (wider
    than 1.7:1) float centred.
- `static/js/explorer.js` — optional router. For same-origin HTML links it
  fetches the page and swaps only `#directory` and `#reader`, updates history,
  title and metadata, and restores scroll on Back/Forward. Where supported,
  page changes cross-fade with a view transition. Feeds, files,
  external and modified clicks stay native; any fetch or markup failure falls
  back to a normal navigation. Every URL is a real Zola page, so refresh,
  direct links, and browsing without JavaScript work the same.
  Project images stay in the reading column, preserve their aspect ratio, and
  are capped at 24rem high; clicking opens the full-resolution original.
- `static/css/main.css` — all styles, as nested component blocks. Colors are
  `light-dark()` tokens on `:root`; `html[data-theme]` pins light/dark.
  The palette is ink on warm paper with a single muted plum accent (lilac in
  dark). Source Serif 4 sets names, titles and everything you read; Inter the
  interface; JetBrains Mono the path and other small technical details.
- `static/css/syntax.css` — code colors (github-light/dark, merged).
- `static/fonts/` — Source Serif 4, Inter, JetBrains Mono (variable
  woff2, latin + latin-ext, from Fontsource).

## Career and project content

- `content/cv.md` is the CV, transcribed from the PDF in `static/cv/`. Keep the
  two in step. `/about/` and `/work/` are aliases that redirect to it.
- `data/consultancies.json` supplies the "All consulting engagements"
  disclosure on the CV (the `engagements()` shortcode).
- `zola.toml` holds the homepage introduction (`bio_1`, `bio_2`).
- `content/projects/` holds project write-ups, ordered by `weight` (lowest
  first). `extra.showcase` picks the projects listed on home; all project pages remain
  available in the project archive. The homepage's featured project is set in
  `content/_index.md`; its card image is `extra.featured_image` (a path under
  `content/` or `static/`), falling back to `extra.screenshot`.
- `static/images/projects/*-running.png` holds captures from actual project runs.
  `extra.screenshot` and `extra.screenshot_alt` supply uncropped card previews
  and, without an `extra.og_image`, the page's social preview.
  Previews and page figures preserve the complete image and its aspect ratio,
  with a 24rem height cap; page figures link to full-resolution originals.
  Fishometry's cover is copied from `Thesis/Supervise/Thesis-Pipeline-Overview-V2.png`
  in its source repository, not from the research explorer.

When refreshing a screenshot, launch the real application in an isolated
workspace and exercise the displayed workflow. Keep client content, credentials
and private paths out of the image. Captions say what the image shows and flag
synthetic samples or stored (rather than freshly computed) results in a few
words.

Check the archive, homepage, and project pages at desktop and mobile widths after
replacement. Zola generates sized WebP previews while preserving the PNG originals.

Keep degree and engagement status current. Describe offline results with their
cohort, baseline and evaluation limits; implementation, deployment and measured
business impact are separate claims. Public pages must not contain private vault
paths, client records or credentials.

## Content helpers

- `{{ figure(src="assets/x.png", alt="…", caption="…") }}` — sized, lazy
  image; rasters are re-encoded to WebP.
  A leading-slash source, such as `/images/projects/muninn-running.png`, resolves
  under `static/` rather than beside the page.
- `{% sidenote(id="unique") %}Note text{% end %}` — numbered note: set in the
  right margin on wide screens, opened below the line with a tap on narrow
  ones. No footnotes; nothing jumps to the bottom of the page.
- `{{ diagram(name="teus", alt="…") }}` — inlines `diagrams/teus.svg`.

## Social cards

Shared links use a 1200×630 card in the site's own type and colours: the site
card (`static/assets/og.png`) and one per article (`static/og/<slug>.png`,
picked up automatically by `templates/page.html`). After adding or renaming an
article, re-render them:

```sh
nix run .#og-cards
```

Projects share their screenshot instead.

## Diagrams

Mermaid sources live in `diagrams/*.mmd`. After editing one, re-render:

```sh
nix run .#diagrams
```

This writes style-free SVGs next to the sources; the site CSS themes them.
Labels are measured with Inter, the font the site draws them in.
