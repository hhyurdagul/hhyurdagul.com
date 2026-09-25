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
- `static/css/main.css` — all styles, as nested component blocks. Colors are
  `light-dark()` tokens on `:root`; `html[data-theme]` pins light/dark.
- `static/css/syntax.css` — code colors (github-light/dark, merged).
- `static/fonts/` — Newsreader, Plus Jakarta Sans, JetBrains Mono (variable
  woff2, latin + latin-ext, from Fontsource).

## Content helpers

- `{{ figure(src="assets/x.png", alt="…", caption="…") }}` — sized, lazy
  image; rasters are re-encoded to WebP.
- `{% sidenote(id="unique") %}Note text{% end %}` — numbered note that
  expands in place.
- `{{ diagram(name="teus", alt="…") }}` — inlines `diagrams/teus.svg`.

## Diagrams

Mermaid sources live in `diagrams/*.mmd`. After editing one, re-render:

```sh
nix run .#diagrams
```

This writes style-free SVGs next to the sources; the site CSS themes them.
