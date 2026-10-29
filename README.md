# hhyurdagul.com

Personal website built with [Zola](https://www.getzola.org/).

```sh
nix develop
zola serve             # local preview; add --drafts to include drafts
zola build             # outputs to public/
nix run .#og-cards     # regenerate the social preview image
```

Content lives in `content/`; CV engagements in `data/consultancies.json`.
`archive/` holds unpublished material. It is excluded from the build but still public in the repo.

Pushes to `master` deploy to GitHub Pages.
