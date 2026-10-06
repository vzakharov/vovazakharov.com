#!/usr/bin/env python3
"""Letter basilisk.fyi's seal: the blank cut plus two lines set along its band.

Usage:
  python3 scripts/letter-basilisk-seal.py --font <JetBrainsMono-Bold.ttf>
                                          --top TEXT --bottom TEXT

Reads `apps/basilisk/public/seal.svg` and writes `seal-lettered.svg` beside it:
the blank's drawing verbatim, and one path of glyph outlines after it. Outlines
rather than `<text>`, because an SVG behind an `<img>` cannot reach a web font.

The top line reads clockwise with its baseline on the band's inner edge; the
bottom line reads left to right with its baseline on the outer edge, so both
stand upright to a reader. Both share one angular step per character, measured
at the capitals' middle, so the two lines keep one rhythm; the step tightens
only as far as the longer line needs to clear the dots at either gap.

The font is JetBrains Mono Bold, the site's memo face. Google Fonts serves it:
`curl -sS -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700"`
names the `fonts.gstatic.com` TTF to download. Requires `fonttools`
(`pip install --target tmp/fonttools fonttools`, then `PYTHONPATH=tmp/fonttools`).

Exit codes:
  0  - written.
  1  - bad arguments, or a character the font has no glyph for.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

from lib.cli import die

SEAL_DIR = Path(__file__).resolve().parent.parent / "apps/basilisk/public"
BLANK = SEAL_DIR / "seal.svg"
LETTERED = SEAL_DIR / "seal-lettered.svg"

INK = "#b3261e"
CENTER = 512

# The band between the inner ring (326, 10 wide) and the outer one (466, 24
# wide), less a margin either side.
BAND_INNER = 353
BAND_OUTER = 432

EM_PX = 100

# Either line's whole span, in degrees, keeping clear of the dots at 0° and 180°.
MAX_SPAN = 148


def glyph_paths(
    font: TTFont, text: str, baseline_r: float, step: float, top: bool
) -> list[str]:
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = EM_PX / font["head"].unitsPerEm
    span = step * (len(text) - 1)
    paths = []

    for i, char in enumerate(text):
        if char == " ":
            continue
        name = cmap.get(ord(char))
        if name is None:
            die(f"no glyph for {char!r}")
        advance = font["hmtx"][name][0]

        # SVG angles: 90° is straight down, so the top line runs clockwise
        # from its left end and the bottom line runs the other way round.
        if top:
            phi = math.radians(-90 - span / 2 + step * i)
            rotation = phi + math.pi / 2
        else:
            phi = math.radians(90 + span / 2 - step * i)
            rotation = phi - math.pi / 2

        x = CENTER + baseline_r * math.cos(phi)
        y = CENTER + baseline_r * math.sin(phi)
        cos, sin = math.cos(rotation), math.sin(rotation)

        # Font units, y up and the glyph's advance centred on the origin,
        # into the seal's canvas: scale, flip, rotate, then translate.
        def place(gx: float, gy: float) -> tuple[float, float]:
            lx, ly = (gx - advance / 2) * scale, -gy * scale
            return (x + lx * cos - ly * sin, y + lx * sin + ly * cos)

        recorded = RecordingPen()
        glyphs[name].draw(recorded)
        pen = SVGPathPen(glyphs, ntos=lambda n: f"{n:.2f}")
        for operator, points in recorded.value:
            # A TrueType contour with no on-curve point ends in `None`.
            getattr(pen, operator)(
                *(None if point is None else place(*point) for point in points)
            )
        paths.append(pen.getCommands())

    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--font", required=True, type=Path)
    parser.add_argument("--top", required=True)
    parser.add_argument("--bottom", required=True)
    args = parser.parse_args()

    # The lines are echoed into the file's XML comment, where `--` is illegal.
    if "--" in args.top + args.bottom:
        die('a line holds "--", which the SVG\'s comment cannot')

    font = TTFont(args.font)
    advance = font["hmtx"][font.getBestCmap()[ord("M")]][0]
    cap = font["OS/2"].sCapHeight * EM_PX / font["head"].unitsPerEm
    advance_px = advance * EM_PX / font["head"].unitsPerEm

    top_mid = BAND_INNER + cap / 2
    bottom_mid = BAND_OUTER - cap / 2
    longest = max(len(args.top), len(args.bottom))
    step = min(
        math.degrees(advance_px / max(top_mid, bottom_mid)),
        MAX_SPAN / (longest - 1),
    )

    letters = [
        *glyph_paths(font, args.top.upper(), BAND_INNER, step, top=True),
        *glyph_paths(font, args.bottom.upper(), BAND_OUTER, step, top=False),
    ]

    blank = BLANK.read_text()
    drawing = blank[blank.index("<svg") : blank.rindex("</svg>")].rstrip()
    comment = f"""<!--
  basilisk.fyi's mark, lettered: `seal.svg`'s drawing verbatim, plus one path of
  JetBrains Mono Bold outlines at {EM_PX} px per em. Generated by
  `scripts/letter-basilisk-seal.py`; edit the blank or the script, not this file.
  Top: {args.top.upper()}. Bottom: {args.bottom.upper()}.
-->
"""
    LETTERED.write_text(
        f'{comment}{drawing}\n  <path d="{" ".join(letters)}" fill="{INK}"/>\n</svg>\n'
    )


if __name__ == "__main__":
    main()
