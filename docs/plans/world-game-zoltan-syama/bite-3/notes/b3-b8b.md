# b3-b8b — the cube sphere's seams, on film

Looked at 6f889531 (`wt/b3-b8a`), the vova static export, headless Chromium over
CDP (swiftshader), 1440×900, through the B7c look driver's helpers. Every frame
is at its spot's sun noon: the driver opens the pose at t 0, reads the
where-line's sun time S, and reopens at t = 12 − S (mod 24). Frames are in
`b3-b8b/`. To find faint defects, each frame was also contrast-equalised, and
the pixels more than 3 grey levels off their 5×5 median were mapped.

## Where the edges are

`cube.ts`: longitude 0 is `+X`, so `px` is centred on 0° N 0° E, the island's
face (10° N 0° E is `px` u 0, v 0.31). The `px`/`nz` edge is exactly the 45° E
meridian for |lat| < 35.26° (`faceToSphere`: lon = πu/4 on `px`). Measured: 10°
N 44.9° E is `px` u +0.998, and 45.1° E is `nz` u −0.998. The pole is the
**centre** of `py`, not an edge or a corner. The nearest corner is 35.264° N 45°
E.

**#1 has no land on any edge.** A 0.5° scan finds 0 land points within u or v
0.985 of a face edge, and #1 is 1.3% land. The whole 45° E meridian is sea
(−3,150 to −3,700 m), so on #1 the crossing only tests the sea surface. That is
why the crossing was flown again on **world #2**, which has hills on the same
meridian at 27° S (764 m at −27, 45).

## 1. Crossing the face edge (45° E, heading east) — pass

| frame                              | hash                                 | tiles under (range) | verdict                                                           |
| ---------------------------------- | ------------------------------------ | ------------------- | ----------------------------------------------------------------- |
| `1-edge-1000km-west.png`           | `#1@10,38,1000000,90,0,16.817`       | 5 (2–6)             | no seam; sea, the island's coast at lower left                    |
| `1-edge-1000km-straddle.png`       | `#1@10,45,1000000,90,0,16.350`       | 5 (2–6)             | no seam along the edge                                            |
| `1-edge-1000km-east.png`           | `#1@10,52,1000000,90,0,15.883`       | 4 (3–5)             | clean                                                             |
| `1-edge-1000km-down.png`           | `#1@10,45,1000000,90,-90,16.350`     | 5 (3–6)             | no seam on the edge, which crosses mid-frame; LOD speckle, below  |
| `1-edge-10km-west.png`             | `#1@10,44.7,10000,90,0,16.367`       | 11 (8–11)           | uniform sea, 16/64/112 at every pixel                             |
| `1-edge-10km-straddle.png`         | `#1@10,44.906,10000,90,0,16.367`     | – (8–11)            | the same; the edge is mid-frame                                   |
| `1-edge-10km-east.png`             | `#1@10,45.1,10000,90,0,16.350`       | 11 (7–11)           | the same                                                          |
| `1-edge-10km-down.png`             | `#1@10,45,10000,90,-90,16.350`       | 11 (10–11)          | the same; the edge runs through the centre                        |
| `1-corner-1000km-down.png`         | `#1@35.264,45,1000000,90,-90,16.350` | 4 (2–4)             | three faces meet mid-frame: no seam, no pinch, 0 outliers         |
| `1-edge-w2-land-1000km-down.png`   | `#2@-27,45,1000000,90,-90,16.350`    | 6 (4–6)             | land on the edge: no seam; LOD speckle in the sea, below          |
| `1-edge-w2-land-10km-west.png`     | `#2@-27,44.7,10000,90,0,16.367`      | 11 (8–11)           | clean                                                             |
| `1-edge-w2-land-10km-straddle.png` | `#2@-27,44.906,10000,90,0,16.367`    | – (8–11)            | hills run across the edge at mid-frame unbroken                   |
| `1-edge-w2-land-10km-east.png`     | `#2@-27,45.1,10000,90,0,16.350`      | 11 (7–11)           | clean                                                             |
| `1-edge-w2-land-10km-down.png`     | `#2@-27,45,10000,90,-90,16.350`      | 11 (10–11)          | the edge runs through the centre: nothing shows, equalised either |

Straight down with heading 90°, screen-up is east, so the edge is the horizontal
line through the frame's centre. None of the 14 frames has a crack, black tile,
pinch or band along it. The "–" under the eye means that tile is culled when
looking ahead.

## 2. Over the North Pole — pass, but dim

| frame                       | hash                           | tiles      | verdict                      |
| --------------------------- | ------------------------------ | ---------- | ---------------------------- |
| `2-pole-1000km-down.png`    | `#1@90,0,1000000,0,-90,19.350` | 4 (2–4)    | uniform dark sea, 0 outliers |
| `2-pole-1000km-horizon.png` | `#1@90,0,1000000,0,90,19.350`  | – (2–4)    | limb and sky; no seam        |
| `2-pole-10km-down.png`      | `#1@90,0,10000,0,-90,19.350`   | 11 (10–11) | uniform dark sea             |
| `2-pole-10km-horizon.png`   | `#1@90,0,10000,0,90,19.350`    | – (5–10)   | horizon; no seam             |

The pose at exactly 90° opens without error. These are weak proofs, though, for
two reasons. First, the pole is the centre of `py`, so there is no edge here to
fail. Second, `heavensAt` keeps the sun on the equator, so at the pole it sits
on the horizon at every hour. `daylight` is ≈ 0.26 there, and the frames average
0–38 in red. #1 is sea at the pole, as at every edge. The corner frame in § 1 is
the test that bites, and it passes.

## 3. #1's island at 10 km, straight down — soft, by the split rule

`3-island-10km-down.png` (`#1@10,0,10000,0,-90,19.350`) and
`3-island-10km-ahead.png` (`#1@10,0,10000,0,0,19.350`) are clean: no seam, no
black tile, no band.

- **The where-line reads `tiles 11 (10–11)`.** So the finest drawn level is 11,
  which is exactly the leaf that `cubeSplitRule` picks there, both with and
  without the coast. (Ground is 416 m and the coast is 60.5 km away, so the
  coast term never fires; on the beach at `INLET_BEACH` it would give 13.) It is
  not `CUBE_MAX_LEVEL` (17). The rule splits while side > distance, and it
  judges distance to ground held at `HIGHEST_GROUND`, 3,509 m. From an eye
  10,416 m over the sea, that distance is ≈ 6.9 km. Level 10 (side 9,773 m)
  splits and level 11 (4,886 m) does not. Level 17 is reached only within ~76 m
  of the ground.
- **What is drawn at level 11:** the vertices are 76 m apart, and
  `cubeDetailCut` stops relief at twice that, 153 m. Straight down, the frame is
  about 9.3 × 15 km at ≈ 10.4 m per pixel. So a grid cell spans ~7 px, and the
  shortest relief wave drawn spans ~15 px. That is the softness, and it is the
  designed resolution (`SPLIT_RATIO` 1, the cut at 2 spacings).
- **Noon makes it worse.** The sun is 80° up, so slopes barely shade. The
  frame's relief only shows when equalised.

## A seam between levels of detail (call 14, not judged here)

In the 1,000 km frames, a row of isolated single bright pixels runs straight
through the sea. In `1-edge-1000km-down.png` it is at y ≈ 722, on both sides of
the coast at lower left, ≈ 42.2° E. That is a level-5/6 tile boundary on `px` (u
= −1 + k/16, lon = πu/4), not the face edge. In `1-edge-w2-land-1000km-down.png`
the same row runs diagonally, from about (520, 720) to (660, 900). The likely
cause is sub-pixel T-junction cracks between tiles of different levels. The
coarse tile's chords sag below the sphere further than the fine tile's (≈ 0.5 m
for a level-5 cell), so the backdrop globe at `R − 1500` shows through as
sparkle. This belongs to B9 / call 14. Not fixed.

## Aside

The #2 hills at 10 km show, once equalised, dimples elongated east–west in rows
(`1-edge-w2-land-10km-down.png`). They are not along any edge, and #1's island
has none. They could be oblique noon light at 27° S, or the noise's lattice. Not
judged.
