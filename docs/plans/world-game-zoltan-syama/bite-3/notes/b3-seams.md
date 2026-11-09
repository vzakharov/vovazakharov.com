# b3-seams — the dark-blue holes on a turn near the ground

Branch `wt/b3-seams`, base 0fcf84d4 (`island/round-world`; its `src/` differs
from Vova's ca6890b0 only in `relief.ts`, the soft floor). Look only, no fix.
Frames in `b3-seams/`; drivers `b3-seams/drivers/*.ts.txt` (run from
`tmp/look/`).

## Verdict: the drawn cover lags the selection, and the policy refuses a stand-in

**The holes are tiles the new view selects that are not in hand yet, drawn as
nothing, because `coverAround` (`pages/island/model/tile-cover.ts`) bars every
stand-in that contains a tile of the last complete selection.** Near the eye
every ancestor up to the root contains one, so nothing stands in, and the globe
at `R − 1500` (`island-scene.ts`, Lambert `SEA_COLOUR`) shows through, walled by
the neighbours' skirts. Not a geometric gap: every hole closes with no change
but tiles arriving, and settled frames have no hole pixel.

- **No outgoing tile is removed before its replacement.** The last complete
  selection (`shown`) is drawn until the new one is wholly in hand; `evict` only
  acts past 900 variants and never on a variant `shown` or the selection stands
  on. What is missing is the _incoming_ ground, never the outgoing.
- **The doc comment says so by design**: "the margin may draw nothing until the
  selection is in hand", to keep a coarse ancestor from hiding the fine ground
  under the eye. On a turn the "margin" is the whole newly turned-in side,
  foreground included.
- **Each hole closes by itself, tile by tile**: a selected tile draws itself the
  moment it arrives (`coverOf`'s own), so a hole lasts one fill latency of that
  tile (b3-lod0 measures latency).

## Evidence

Vova's frame: `vova-ca6890b0-14.25s.png` (his video at 14.25 s,
`#0@38.30679,15.90290,529.1,139.0,25.8`, panel `tiles — (8–17)`). Hole colour
(5, 34, 66), flat, no shading.

**Single turns** at his spot (`#0@38.30756,15.90432,546,220.1,25.8`), each from
a settled view; frame `a` is rendered and read from the canvas in the same task
as `turnTo`, so no tile can arrive before it (`calabria-546m-*`):

| turn         | new tiles | got at +30 / +100 / +300 ms | hole px `a` → `b-100ms` → settled |
| ------------ | --------- | --------------------------- | --------------------------------- |
| 220.1 → 200° | 42        | 9 / 20 / 42                 | 29,508 → 8,808 → 8,904            |
| → 180°       | 53        | 11 / 29 / 53                | 11,460 → 8,396 → 8,444            |
| → 160°       | 39        | 10 / 23 / 39                | 15,200 → 7,632 → 7,656            |
| → 139°       | 42        | 11 / 30 / 42                | 26,728 → 6,408 → 6,412            |

(Pixel counts include ~6–9k of real sea at the horizon, the settled floor.) `a`
frames show Vova's shape: a dark-blue block lower-left, on the side turned into,
walled by skirts.

**Fast turn** (`spin-fast-*`, 8 steps of −12°, one frame each, no wait; hole px
below the horizon): turn01 0, turn02 32k, turn04 169k, turn08 420k; then held
still: +1 frame 403k, +3 frames 26k, +4 frames 0. Holes grow while the turn
outruns the fills and close by themselves once it stops. A slow turn (30 × −3°)
under this headless renderer (~2 s a frame) shows none: each step's ~5 tiles
land before the next frame.

**The policy in Node** (`holes.ts.txt`: `coverAround` with the 220.1° selection
and the roots in hand): after a turn to 200 / 180 / 160 / 139°, 38 / 82 / 115 /
157 selected tiles are not in hand, and **all of them** are uncovered — the
cover is the 290 shown tiles and no stand-in. Levels 6–17; the level-11 band
holds the most (14–64).

## Run 2 — Vova's #1 seam band, settled (look only)

Built at 1aeecf72 (head; bb6bc262 adds only a memo) and at Vova's 9e01421e
(`git archive` into `tmp/old9e`, `node_modules` hard-linked). Frames in
`b3-seams/run2/`, 1440×900, settled (`setHeight` twice with 1.5 s between, then
3 frames); drivers `drivers/seams2.ts.txt` (run from `tmp/look/`) and
`drivers/edges.py.txt`. Tint: a throwaway build of each tree with every tile's
land drawn flat in a colour per level (`level % 12`; sea at 0.3 of it), never
committed, `src/` reverted.

**Verdict: gone on the current build — and it was never a level seam.** The
ragged band in Vova's view is the flat lowland floor: at 9e01421e a flat beige
strip crosses the middle distance (rows ~520–630) with the feet of the hills cut
off raggedly along it (`9e01421e-vova1-121m.png`). On head the same ground rolls
and the strip is gone (`vova1-121m.png`). The floor's two commits are what
removed it — de89a374 (floor rolls with the broad relief) and 6130a442 (ground
under the floor squeezed, not cut); which of the two did it alone was not split
(no build of de89a374 by itself).

- **Not where levels meet.** Level edges drawn red over the plain frames
  (`*-level-edges.png`): the band's edges do not follow them, and the levels (17
  at the feet to 12 at the horizon) lie identically in both builds.
- **The level edges themselves show nothing**, in either build: no crack, step,
  shading or colour break along them at 3× (`vova1-121m-crop-stair.png`, the
  stepped 14/15 edge: old, old with edges, head; `vova1-121m-crop-edges.png`,
  the 15/16 and 14/15 edges right of centre: old, head, head with edges).
- No hole or stand-in in either settled frame.

**The #0 sweep** (Italy / Japan / Florida at 10 km and 100 m, forward and down;
`seams2.ts <italy|japan|florida>`, look +80° forward, −90° down, hour =
shot-sets' afternoon less 1 h) is Run 3.

## Run 3 — the #0 sweep, settled (look only)

Head 1aeecf72's plain and tinted exports (`tmp/out-head`, `tmp/out-tint`, as Run
2), `seams2.ts <italy|japan|florida> run3`, then `TAG=tint-` on the tinted one;
1440×900, settled. Frames in `b3-seams/run3/`
(`w0-<place>-<10km|100m>- <fwd|down>.png`, tinted twins `tint-…`,
`*-level-edges.png` level edges red and coast yellow, `*-crop-*.png` 3× crops:
plain above, edges below). Counts by `drivers/count3.py.txt` and
`drivers/step3.py.txt`.

**Verdict: no seam on #0 either, settled.** At 3× along every level edge in all
twelve frames: no crack, step, shading or colour break; hills, sand patches and
beaches run across the edges unbroken. No pixel of sky or the globe's sea colour
below the horizon in any frame (#1's Vova frame: none either).

| place   | 10 km fwd                       | 10 km down                     | 100 m fwd            | 100 m down         |
| ------- | ------------------------------- | ------------------------------ | -------------------- | ------------------ |
| Italy   | clean (`crop-edges`)            | clean (`crop-edge`), see below | clean, flat sand     | one level, no edge |
| Japan   | clean (`crop-edges`)            | one level, no edge             | clean (`crop-edges`) | one level, no edge |
| Florida | clean, coast too (`crop-coast`) | clean, open water              | water (Okeechobee)   | water, one level   |

**The number: #0 does not have more level edges or coast on screen than #1.**
Level-edge px are tint changes between two ground px of one land/sea class;
coast px are plain sea/land changes.

| frame                 | ground px | level-edge px | % of ground | coast px  |
| --------------------- | --------- | ------------- | ----------- | --------- |
| #0 Italy 10 km fwd    | 521,357   | 14,381        | 2.8         | 1,757     |
| #0 Japan 10 km fwd    | 518,943   | 10,861        | 2.1         | 1,429     |
| #0 Florida 10 km fwd  | 521,044   | 13,270        | 2.5         | 1,007     |
| #0 Italy 100 m fwd    | 540,939   | 12,949        | 2.4         | 454       |
| #0 Japan 100 m fwd    | 543,647   | 13,093        | 2.4         | 422       |
| #0 Florida 100 m fwd  | 539,445   | 15,488        | 2.9         | 1,819     |
| #0 down (6 frames)    | 1,296,000 | 0 – 7,810     | 0 – 0.6     | 0 – 2,013 |
| #1 Vova 121 m (Run 2) | 740,523   | 16,146        | 2.2         | 2,596     |

(100 m coast counts are mostly false hits on the horizon line.) Level edges are
a property of the screen-space selection, not the ground, so per screen they are
the same on both worlds; #1's one frame has the most coast.

**And #0's edges do not look worse.** Below the horizon band and 3 px clear of
coast, the plain colour step across a level edge (sum of |ΔRGB| of the two
neighbours) has median 0–3 on #0 against 0–1 elsewhere in the same frame; #1's
frame 4 against 2. The tail above that is ridge silhouettes and sand/grass
borders the edges happen to run along, which the crops show unbroken.

**What could read as a seam on #0 and is not one:** Italy 10 km down
(`crop-straight-coast`) has a beach cut as a straight line ~1000 px long, one
level on both sides in the tint: the coast data's own straight segment, not a
tile edge. Not checked whether Vova's "seams" are this.

**Not covered:** only settled frames; seams that show during motion (Run 1's
holes) were not compared between worlds. #1 is one frame at one pose, not a
matched 10 km / 100 m sweep.

## Left (not done)

- Fix options for the lead (none tried): admit a stand-in that contains a shown
  tile but draw it only outside the shown tiles' footprint (a stencil or depth
  pre-pass of `shown`, or the stand-in pushed slightly below so shown wins); or
  widen the frustum margin so a turn lands on tiles already selected; or keep
  the previous selection's tiles beyond the frustum held and drawn.
