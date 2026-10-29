# hhyurdagul.com

A personal website built with [Zola](https://www.getzola.org/), handwritten CSS,
and self-hosted fonts. No frontend framework or JavaScript package manager is
needed.

## Local development

The Nix development shell supplies Zola 0.22.x; CI uses Zola 0.22.1.

```sh
nix develop
zola serve
```

Open the local address printed by Zola. To build or check links:

```sh
zola build             # generates public/
zola check            # validates content and links; external checks need network access
```

## Repository layout

- `zola.toml` — site settings, contact links, and homepage introduction.
- `content/` — the public homepage metadata, CV, projects, and writing.
- `data/consultancies.json` — the complete grouped CV engagement records.
- `templates/` — HTML templates, the shared page header, and primary navigation.
- `static/` — CSS, fonts, icons, project images, and site preview image.
- `scripts/og-cards.py` — generates the site preview image.
- `archive/` — historical content, supporting assets, and the original CV.
- `.github/workflows/deploy.yml` — build, link checks, and GitHub Pages deployment.
- `public/` — generated output, ignored by Git.

## Browser behavior

Links use ordinary browser navigation. CSS enables native cross-document view
transitions where supported; other browsers navigate normally. Reduced-motion
preferences disable the transitions.

CSS follows the system's light or dark color scheme, including changes while the
page is open. There is no theme switch or saved override; old `theme` values in
localStorage are ignored.

The header pairs a parent-only breadcrumb on the left with contextual navigation
on the right. `hhyurdagul` is the Home link. The current page's
title stays in its heading rather than repeating in the breadcrumb: `/writing/`
shows `hhyurdagul`, a post shows `hhyurdagul/writing`, and a project shows
`hhyurdagul/projects`. The CV and not-found page show only the root link.

When a section is already a clickable breadcrumb, its duplicate is omitted from
the right-hand menu: posts show **Projects / CV** and project pages show
**Writing / CV**. Home, section indexes, the CV, and not-found pages retain
**Projects / Writing / CV**. Every header destination appears exactly once.

Navigation shares the breadcrumb's monospace type and text baseline. Section
indexes underline their active menu item; detail pages use the parent breadcrumb
for section context. Section links retain 44px touch targets.
On narrow screens, parent segments can wrap while the navigation stays aligned
right on the root link's row. The header scrolls normally; there is no fixed
bottom navigation. Navigation and theming work without JavaScript.
No third-party scripts, icon libraries, or remote fonts are loaded.

## Updating content

Edit the homepage introduction in `zola.toml` (`bio_1` and `bio_2`), its search
and sharing description in `content/_index.md`, and the CV in `content/cv.md`.
Other projects, older writing, topic pages, and publication lists remain archived.
RSS and Atom feeds are disabled.

### CV engagements

The Consulting section in `content/cv.md` includes `{{ engagements() }}`. Its
shortcode renders `data/consultancies.json` as a normally closed **All consulting
engagements** disclosure. Opening it shows every group, company, and date; each
entry opens separately to its description, domains, tools, and company website.
Both levels use native `<details>` and work with the keyboard and without JavaScript.

Update the active JSON file rather than the historical copy in `archive/`.
Group and item order control the display order; the entry count is calculated
automatically and includes the reusable tools group. Historical `project_url`
associations remain in the data, but this disclosure links company websites only:
those older project case studies are still archived.

### Writing

Add a Markdown file under `content/writing/`, or use a page bundle such as
`content/writing/my-note/index.md` to keep images beside a note. Each writing needs
a title, description, and date:

```toml
+++
title = "A question worth exploring"
description = "What I tried, what happened, and what I learned."
date = 2026-10-29
+++
```

Write the article in Markdown after the closing `+++`. The section automatically
lists entries newest first and supplies the article template, publication date,
and reading time. The filename (or bundle directory) determines the URL.
Set `draft = true` in the front matter to keep an unfinished article out of a
normal build; use `zola serve --drafts` to preview it.

The homepage's Writing section shows the three newest published writings as
compact title/month-year rows. Its heading opens `/writing/`, which uses the same
rows for the full list. Drafts and entries marked `is_template = true` are excluded
from the homepage, including during draft preview. The section stays hidden until
at least one real writing is published.

`content/writing/writing-template.md` is a draft-only starting point, excluded from
normal builds. Preview it with `zola serve --drafts`. Its `[extra] is_template = true`
flag labels the preview **Template** instead of showing a publication date and
adds `noindex` to its article page. To publish a copy, choose a new filename,
replace the title, description, date, and body, and remove both `draft = true`
and `is_template = true`.

### Projects

Projects live under `content/projects/`, ordered by `weight`. Muninn is restored
as a complete example, with its screenshot and write-up. Its `[extra] showcase = true`
flag includes it in the homepage's horizontal card strip. `/projects/` shows all
published projects in a card grid with short summaries.

Use `content/projects/muninn.md` as a content example. Put screenshots under
`static/` and set `screenshot` to their path without the `static/` prefix; provide
`screenshot_alt` as well. Cards and the `figure` shortcode create WebP previews
with intrinsic dimensions. Project pages close with status, role, stack, dates,
and source/demo links when those fields are present.

Project cards and compact writing rows reuse the presentation from `84b8d59`,
implemented in `templates/macros/directory.html` and `static/css/main.css`.
Restoring another archived project also requires its images and any shortcodes
it uses. Do not copy old `[taxonomies]` blocks unless topic pages are re-enabled.

### Assets and archived content

Everything in `static/` is copied into the website. Keep withdrawn material in
`archive/`, outside both `content/` and `static/`, until it is ready to publish.
The archive is excluded from the site build, **not private storage**: files in a
public repository and its Git history remain accessible.

After changing the site's name or role, regenerate its social preview:

```sh
nix run .#og-cards
```

## Deployment

Pushes to `master` build and deploy the generated site through GitHub Pages.
Pull requests run the build and link checks without deploying. The workflow
publishes the generated website, not the repository archive.
