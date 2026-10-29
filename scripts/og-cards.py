"""Render the site's social-preview card (1200x630 PNG).

Writes static/assets/og.png in the site's own type and colours.
Run with `nix run .#og-cards` from the repository root.
"""
import html
import pathlib
import tempfile
import tomllib

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path.cwd()
FONTS = ROOT / "static" / "fonts"
config = tomllib.loads((ROOT / "zola.toml").read_text())
AUTHOR = config["extra"]["author"]
ROLE = config["translations"]["role"]
HANDLE = config["extra"]["logo_text"]


def face(family, stem, weight):
    return "".join(
        f'@font-face{{font-family:"{family}";font-weight:{weight};'
        f'src:url("{(FONTS / stem.format(subset)).as_uri()}") format("woff2");{rng}}}'
        for subset, rng in (("latin", ""), ("latin-ext", "unicode-range:U+0100-024F,U+1E00-1EFF;"))
    )


STYLE = (
    face("Source Serif 4", "source-serif-4-{}-opsz-normal.woff2", "200 900")
    + face("Inter", "inter-{}-opsz-normal.woff2", "100 900")
    + face("JetBrains Mono", "jetbrains-mono-{}-wght-normal.woff2", "100 800")
    + """
html,body{margin:0;width:1200px;height:630px;background:#F6F7F8;color:#0E1013}
.card{box-sizing:border-box;width:1200px;height:630px;padding:84px 96px;display:flex;flex-direction:column}
.path{font:400 24px/1 "JetBrains Mono",monospace;color:#6B717A}
.path b{font-weight:400;color:#0E1013}.path i{font-style:normal;color:#B9C0C9}
h1{margin:60px 0 0;font:500 var(--size)/1.06 "Source Serif 4",serif;letter-spacing:-0.012em;text-wrap:balance}
.sub{margin-top:26px;font:400 32px/1.35 "Inter",sans-serif;color:#474C54}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;
      border-top:2px solid #DCE0E5;padding-top:28px;font:400 26px/1 "Inter",sans-serif;color:#6B717A}
.foot span:first-child{color:#1E3FA0}
"""
)


def card(path, title, sub, foot_right, size):
    path_html = f' <i>/</i> '.join(html.escape(p) for p in path[:-1])
    path_html += f' <i>/</i> <b>{html.escape(path[-1])}</b>'
    return (
        f'<!doctype html><meta charset="utf-8"><style>{STYLE}</style>'
        f'<div class="card" style="--size:{size}px"><div class="path">{path_html}</div>'
        f'<h1>{html.escape(title)}</h1>'
        + (f'<div class="sub">{html.escape(sub)}</div>' if sub else "")
        + f'<div class="foot"><span>{HANDLE}.com</span><span>{html.escape(foot_right)}</span></div></div>'
    )


def main():
    target = ROOT / "static" / "assets" / "og.png"
    document = card([HANDLE, "home"], AUTHOR, ROLE, "CV · Contact", 92)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        with tempfile.TemporaryDirectory() as tmp:
            # A file:// page may load the local font files; set_content may not.
            source = pathlib.Path(tmp) / "card.html"
            source.write_text(document)
            page.goto(source.as_uri())
            page.evaluate("document.fonts.ready")
            missing = page.evaluate(
                "['Source Serif 4', 'Inter', 'JetBrains Mono']"
                ".filter(f => !document.fonts.check(`16px '${f}'`))")
            if missing:
                raise SystemExit(f"fonts did not load for {target.name}: {missing}")
            page.screenshot(path=str(target))
            print(f"rendered {target.relative_to(ROOT)}")
        browser.close()


if __name__ == "__main__":
    main()
