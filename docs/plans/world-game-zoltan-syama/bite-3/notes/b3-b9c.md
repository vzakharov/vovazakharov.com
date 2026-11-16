# b3-b9c — call 14's stitch on film

Looked at 9e01421e (after the stitch) and 706ce67d (`island/round-world` just
before the b9a merge, built in a scratch copy) through B8b's driver, extended in
`b3-b9c/look.ts.txt`: same CDP helpers, 1440×900, plus a `Worker` spy that logs
every fill asked and every tile got with its `fillMs`, and runs (descent, turn,
glide) that are written but not yet flown. `b3-b9c/before/` holds the 706ce67d
frames.

## 0. Vova's "склейка": a lowland floor, not a seam

`#1@10.35272,-0.47434,121.6,16.1,10.2,0.000`, `tiles 17 (6–17)`. Frames:
`0-vova-sand-121m.png` (after), `before/0-vova-sand-121m.png` (before),
`0-vova-sand-121m-tiles.png` (tile edges red, level changes yellow, the lowland
floor blue, from `sand.ts.txt`, which re-runs the page's selection in Node and
casts a ray per 4 px).

**The flat band is ground clamped to the lowland floor** (`relief.ts`:
`smoothMax(height, lowland, lowland)`, `LOWLAND_METRES` 15 approached over 5
km). There, ~560–590 m from the coast, the floor is 15·(1 − e^(−0.115)) ≈ 1.6 m,
and the noise's troughs sink below it, so the ground is a flat sheet at 1.6 m
with no relief and no shading. The ray probe down the centre column reads ground
1.63 / 1.60 / 1.58 m at y 560–580 (distance 810–730 m), then the ridge in front
at 22.7 m (y 590). Its near edge is that ridge's silhouette; its far edge is
where the noise climbs back over the floor, with the 1.6 m rounding band (k =
the floor itself) too narrow to soften it.

Why it is not the stitch, a mixed cover, the skirt or the `finest` caveat:

- **The blue mask is the band, pixel for pixel, and tile edges cross it
  obliquely** (yellow 14/15 and 15/16 edges run through it, not along it).
- **Before and after are the same picture**: 5,130 pixels differ, by at most 20
  grey levels, scattered; the band is in both.
- **The drawn heights equal the full-detail ones** there (1.63 vs 1.63 m): the
  cut (13–19 m at those distances) removes nothing from a flat sheet.
- The frame is a settled cover (`setHeight` resolved), so no stand-in.

"A softer step near the green" is the land colour by height (`land-colour`),
which turns green as the ground climbs past the band; no tile edge follows it.

Fix options (a terrain call, not call 14; none tried):

1. **Widen the floor's rounding**: `smoothMax(height, lowland, k)` with k ≈ 5–10
   m instead of 1.6 m. The flat stays flat but its rim rounds over ~k/slope
   metres (slopes here ≈ 0.1, so 50–100 m), removing the crease. Cheap; the
   floor still has no texture.
2. **Ride the finest octaves on the floor**: add the octaves ≤ 25 m (2.5 +
   1.25 + 0.6 m amplitude, ≈ 4.4 m at most) after the clamp, scaled by
   `lowland / LOWLAND_METRES` so it vanishes at the coast. The floor then has
   the same fine grain as the dunes around it. At 570 m inland the scale is
   0.11, ≈ ±0.5 m — not enough to texture it; scaling by the floor's own
   approach is what keeps sea from showing inland, so this needs a floor above
   the ripple's depth, which is option 3.
3. **Raise the floor near the coast less steeply but keep relief**: a floor that
   is `max(lowland, ...)` of a smoothed copy of the noise (its octaves ≥ 400 m)
   rather than a constant, so troughs bottom out on a gently rolling surface.
   Costs one extra partial noise evaluation per sample (≈ the regional octaves,
   8 of 17).

## Driver after call 18 (B9c-2)

The rest was shot on `wt/b3-b9c` merged with `island/round-world` at be19f1b8
(call 18's panel). Call 18 retired the play hook's `where()`, and the panel
shows nothing under play (`pace` is undefined there), so `look.ts.txt` now
summarises a shot from the `Worker` spy (tiles got, level range, stitched), and
finds sun noon as B8b measured it: sun time at t 0 is 16.65 h + lon/15. Runs
open at look +14 (`LOOK=` overrides). Each shot's fill log goes to
`tmp/look/data/shot-<name>.json`.

## 1. The 1,000 km speckle — not gone: unchanged, pixel for pixel

| frame                            | tiles (levels), stitched | after vs before                 | deep-sea sparkle px (before → after)    |
| -------------------------------- | ------------------------ | ------------------------------- | --------------------------------------- |
| `1-edge-1000km-down.png`         | 152 (2–6), 35            | 15 px differ, by ≤ 1 grey level | 10 → 10; 8 of them the row at y 721–724 |
| `1-edge-w2-land-1000km-down.png` | 186 (2–6), 33            | 599 px differ, by ≤ 9 (land)    | 25 → 25; 22 on B8b's diagonal           |

`before/` holds the same poses on the pre-stitch build (706ce67d), and its
frames are byte-identical to B8b's PNGs, so B8b's are a fair before. On the
equalised maps (`maps/*-outliers.png`; `speckle.py.txt`) the outlier counts are
the same before and after: 48 (35 in the sea) and 79,403 → 79,369 (154 in the
sea both times). Every sea outlier sits at the same pixel with the same colour.

**The stitch is in the drawn cover, and the sparkle survives it.** The row at y
≈ 722 is lon 42.19° E, the edge between `px` level 6 x 61 and level 5 x 31, and
the level-6 tiles there arrive as stitched variants (`px|6|61|42`, right edge
5). Each sparkle is one pixel of (18, 68, 117) in sea of (16, 63, 111): the
globe at `R − 1500` (same `SEA_COLOUR`, lit by its own sphere normals) showing
through.

**Cause: T-junctions, not a gap.** The sea is height 0 at every level, so the
fine tile's in-between border vertex sat ≈ 0.5 m off the coarse chord before the
stitch — at ~1 km a pixel, 1/2000 px. Putting it on the chord changes nothing a
rasteriser can see. What leaks is the T-junction itself: the coarse triangle's
edge and the fine tile's two half-edges are separate edge equations, and float
rounding leaves an occasional pixel centre that neither covers. Only shared
vertices close that; a position fix cannot. Skirts do not hide it straight down,
where a vertical skirt is edge-on.

Fix options (none tried):

1. **Close the T-junction topologically**: on a border meeting a coarser tile,
   index the border row as a fan to the coarse vertices only, skipping the
   in-between vertex (it can stay in the buffer, unused). Watertight by
   construction; the worker already knows `levels`, so the index buffer goes
   with the variant (at most 16 edge masks, cacheable per mask and grid). Cost:
   index build, no extra samples.
2. **Give the coarse side the fine vertices**: the coarser tile adds the
   midpoints on an edge it shares with a finer one. Also watertight, but makes
   the coarse tile's variant depend on its finer neighbours — a second variant
   axis and more re-fills (§ 3 already shows 11–33 % of worker time on them).
3. **Hide it**: paint what shows through like what it shows through (globe lit
   as the sea tile is). Cosmetic, and only over sea: a land T-junction would
   still leak blue.

## 2. A 10 km hillside on #2 — clean

`2-hill-10km-ahead.png` (`#2@-28,42.5,10000,90,0,13.517`) and
`2-hill-10km-down.png` (`…,90,-90,13.517`). The spot is the most relief near
B8b's hills: a 0.25° scan of −30…−24° S, 42…48° E (`hill.ts.txt`) finds 521 m of
range within ±4 km at −28, 42.5 (ground 820 m), on `px` u 0.944, clear of the
face edge so a seam cannot be the face's. Sun time 9:00, so slopes shade.

Level changes are in both: ahead draws 8–11 (16 level-10, 18 level-11 tiles, 24
stitched), down 10–11 (14 stitched). Neither frame, nor its equalised copy,
shows a straight line, a crease or a lighting step anywhere: relief runs across
the tiles unbroken. The white patch at the frame's edge is not judged.

## 3. Worker fills over the runs (look +14, 10 km)

Inland is the hillside above (heading 90); the coast is B7c's
`19.968265, 4.750977` (heading 0). Descent: 12 km × 0.98ⁱ, 21 steps; turn: 20 ×
0.05 rad; glide: 20 × 200 m east. Each run took 5–8 s; counts are from the
opening settled on. "Ground / sea / both" is what the tile carries.

| run            | asks (stitched) | re-fills of a key held | churn | fill ms stitched: ground / sea / both (median, p90, n) | fill ms flat (median, n) |
| -------------- | --------------- | ---------------------- | ----- | ------------------------------------------------------ | ------------------------ |
| inland-descent | 69 (13)         | 8                      | 0     | 24, 41, 13 / – / –                                     | 26, 56                   |
| inland-turn    | 127 (47)        | 33                     | 0     | 20, 33, 47 / – / –                                     | 21, 80                   |
| inland-glide   | 98 (25)         | 32                     | 0     | 27, 40, 25 / – / –                                     | 29, 73                   |
| coast-descent  | 181 (57)        | 41                     | 0     | 23, 27, 26 / 28, 39, 9 / 27, 46, 22                    | 21, 128                  |
| coast-turn     | 177 (64)        | 63                     | 0     | 22, 35, 62 / – / 23, 24, 2                             | 24, 113                  |
| coast-glide    | 91 (29)         | 22                     | 0     | 28, 42, 20 / 51, 54, 3 / 40, 56, 6                     | 24, 62                   |

Worker time per run and the share spent re-filling a key already held under
other neighbour levels: inland 1,964 ms (11 %), 3,136 (25 %), 2,892 (32 %);
coast 4,609 (28 %), 4,522 (33 %), 2,608 (30 %). Ask to arrival: median 44–56 ms,
p90 68–93. Four asks per run (none on coast-descent) never arrived before the
run ended; the selection had moved on.

- **A stitched fill costs what a flat one does**: 20–28 ms median against 21–29
  ms; the sea-only and both-kinds rows are small samples.
- **Churn is zero**: no variant was asked again after it arrived.
- **The stitch's cost is the re-fill**: a tile whose neighbour changes level is
  filled again, 8–63 asks a run, a quarter to a third of the worker's time on
  turns and glides.
