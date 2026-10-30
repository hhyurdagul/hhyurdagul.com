"""Render the MdsAI project card cover (1200x900 PNG).

Writes static/images/projects/mdsai-card.png: past tickets as coloured
clusters, a new ticket landing among them, the cited draft it produces, and
the headline result. Colours follow the MdsAI demo; type is the site's own.
Run from the repository root, in the same environment as `nix run .#og-cards`:

    PLAYWRIGHT_BROWSERS_PATH=$(nix eval --raw nixpkgs#playwright-driver.browsers.outPath) \
    nix shell --impure --expr 'with import <nixpkgs> {}; python3.withPackages (ps: [ ps.playwright ])' \
      -c python3 scripts/mdsai-card.py
"""
import math
import pathlib
import random
import tempfile

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path.cwd()
FONTS = ROOT / "static" / "fonts"
TARGET = ROOT / "static" / "images" / "projects" / "mdsai-card.png"
W, H = 1200, 900

HEADLINE = "15.5 h → 2.4 h"
SUBLINE = "median first reply, before and after MdsAI"
EYEBROW = "MdsAI · 60+ municipalities"

# Cluster centres and colours from the demo's category map.
CLUSTERS = [
    ((150, 560), "#E07A5F"),
    ((330, 470), "#5B8DEF"),
    ((520, 560), "#D99A2B"),
    ((190, 760), "#8B7CF6"),
    ((420, 790), "#33A391"),
    ((640, 760), "#D46A93"),
    ((1080, 820), "#7AAA43"),
]
TICKET = (265, 720)  # lands in the violet cluster


def face(family, stem, weight):
    return "".join(
        f'@font-face{{font-family:"{family}";font-weight:{weight};'
        f'src:url("{(FONTS / stem.format(subset)).as_uri()}") format("woff2");{rng}}}'
        for subset, rng in (("latin", ""), ("latin-ext", "unicode-range:U+0100-024F,U+1E00-1EFF;"))
    )


def dots():
    rnd = random.Random(7)
    out = []
    for (cx, cy), colour in CLUSTERS:
        for _ in range(16):
            x = cx + (rnd.random() + rnd.random() + rnd.random() - 1.5) * 110
            y = cy + (rnd.random() + rnd.random() + rnd.random() - 1.5) * 80
            out.append((x, y, colour))
    return out


def svg():
    pts = dots()
    violet = [p for p in pts if p[2] == "#8B7CF6"]
    near = sorted(violet, key=lambda p: math.dist(p[:2], TICKET))[:5]
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
             '<defs><radialGradient id="glow" cx="30%" cy="80%" r="70%">'
             '<stop offset="0" stop-color="#2A2550"/><stop offset="1" stop-color="#14131B"/></radialGradient></defs>',
             f'<rect width="{W}" height="{H}" fill="url(#glow)"/>']
    for x, y, c in pts:
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="{c}" fill-opacity="0.88"/>')
    for x, y, _ in near:
        parts.append(f'<line x1="{TICKET[0]}" y1="{TICKET[1]}" x2="{x:.1f}" y2="{y:.1f}" '
                     'stroke="#ffffff" stroke-opacity="0.7" stroke-width="3" stroke-dasharray="6 6"/>')
    tx, ty = TICKET
    parts.append(f'<circle cx="{tx}" cy="{ty}" r="40" fill="#8B7CF6" fill-opacity="0.25" stroke="#B4AAFF" stroke-width="4"/>')
    parts.append(f'<circle cx="{tx}" cy="{ty}" r="18" fill="#ffffff"/>')
    parts.append("</svg>")
    return "".join(parts)


STYLE = (
    face("Source Serif 4", "source-serif-4-{}-opsz-normal.woff2", "200 900")
    + face("Inter", "inter-{}-opsz-normal.woff2", "100 900")
    + face("JetBrains Mono", "jetbrains-mono-{}-wght-normal.woff2", "100 800")
    + f"""
html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:#14131B}}
.art{{position:absolute;inset:0}}
.text{{position:absolute;left:72px;top:68px;color:#F4F2FF}}
.eyebrow{{font:500 28px/1 "JetBrains Mono",monospace;color:#A9A3D6;letter-spacing:.01em}}
h1{{margin:26px 0 0;font:600 128px/1 "Source Serif 4",serif;letter-spacing:-0.02em}}
.sub{{margin-top:22px;font:400 32px/1.3 "Inter",sans-serif;color:#C9C5E6}}
.draft{{position:absolute;right:64px;top:420px;width:470px;padding:30px 32px;border-radius:24px;
  background:#FFFFFF;box-shadow:0 30px 60px -20px rgb(0 0 0 / .6);font-family:"Inter",sans-serif}}
.head{{display:flex;align-items:center;gap:14px;font:700 26px/1 "Inter",sans-serif;color:#1C1B29}}
.head i{{width:14px;height:14px;border-radius:50%;background:#1F9D55}}
.head span{{margin-left:auto;font:500 22px/1 "JetBrains Mono",monospace;color:#7C7A93}}
.line{{display:flex;align-items:center;gap:10px;margin-top:22px}}
.bar{{height:16px;border-radius:8px;background:#E6E4F0}}
.cite{{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#ECEAFE;
  color:#4F46E5;font:700 20px/1 "Inter",sans-serif}}
.ok{{display:inline-flex;align-items:center;gap:10px;margin-top:28px;padding:14px 22px;border-radius:14px;
  background:#1F9D55;color:#fff;font:700 24px/1 "Inter",sans-serif}}
"""
)

DOCUMENT = f"""<!doctype html><meta charset="utf-8"><style>{STYLE}</style>
<div class="art">{svg()}</div>
<div class="text"><div class="eyebrow">{EYEBROW}</div><h1>{HEADLINE}</h1><div class="sub">{SUBLINE}</div></div>
<div class="draft">
  <div class="head"><i></i>Cited draft<span>~5 s</span></div>
  <div class="line"><div class="bar" style="width:300px"></div><div class="cite">1</div><div class="cite">2</div></div>
  <div class="line"><div class="bar" style="width:350px"></div><div class="cite">1</div></div>
  <div class="line"><div class="bar" style="width:250px"></div><div class="cite">3</div></div>
  <div class="ok">✓ Expert approves</div>
</div>"""


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H})
        with tempfile.TemporaryDirectory() as tmp:
            # A file:// page may load the local font files; set_content may not.
            source = pathlib.Path(tmp) / "card.html"
            source.write_text(DOCUMENT)
            page.goto(source.as_uri())
            page.evaluate("document.fonts.ready")
            missing = page.evaluate(
                "['Source Serif 4', 'Inter', 'JetBrains Mono']"
                ".filter(f => !document.fonts.check(`16px '${f}'`))")
            if missing:
                raise SystemExit(f"fonts did not load: {missing}")
            page.screenshot(path=str(TARGET))
        browser.close()
    print(f"rendered {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
