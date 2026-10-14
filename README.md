# hhyurdagul.com

Personal site, built with [Zola](https://www.getzola.org/). Hand-written CSS,
self-hosted fonts, no third-party requests, and one small inline script (the
theme toggle).

## Develop

```sh
nix develop            # shell with the pinned zola (0.22.x, same as CI)
zola serve             # http://127.0.0.1:1111
zola check             # build + link check
```

## Layout

- `templates/` — Tera templates. `base.html` holds the three-column shell; the
  mobile drawers are native `popover` elements, so they need no JS.
  Project images stay in the reading column, preserve their aspect ratio, and
  are capped at 24rem high; clicking opens the full-resolution original.
- `static/css/main.css` — all styles, as nested component blocks. Colors are
  `light-dark()` tokens on `:root`; `html[data-theme]` pins light/dark.
- `static/css/syntax.css` — code colors (github-light/dark, merged).
- `static/fonts/` — Newsreader, Plus Jakarta Sans, JetBrains Mono (variable
  woff2, latin + latin-ext, from Fontsource).

## Career and project content

- `data/professional_roles.json` and `data/consultancies.json` supply the Work page.
- `content/about.md` holds the biography and selected publications; `zola.toml`
  holds the homepage introduction.
- `content/projects/` holds project write-ups, ordered by `weight` (lowest
  first). `extra.showcase` controls homepage cards; all project pages remain
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
- `{% sidenote(id="unique") %}Note text{% end %}` — numbered note that
  expands in place.
- `{{ diagram(name="teus", alt="…") }}` — inlines `diagrams/teus.svg`.

## Diagrams

Mermaid sources live in `diagrams/*.mmd`. After editing one, re-render:

```sh
nix run .#diagrams
```

This writes style-free SVGs next to the sources; the site CSS themes them.
