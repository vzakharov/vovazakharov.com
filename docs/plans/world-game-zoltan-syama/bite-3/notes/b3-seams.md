# b3-seams — the dark-blue holes on a turn near the ground

Branch `wt/b3-seams`, base 0fcf84d4 (`island/round-world`; its `src/` differs
from Vova's ca6890b0 only in `relief.ts`, the soft floor). Look only, no fix.
Frames in `b3-seams/`; drivers `b3-seams/drivers/*.ts.txt` (run from `tmp/look/`).

## Verdict: the drawn cover lags the selection, and the policy refuses a stand-in

**The holes are tiles the new view selects that are not in hand yet, drawn as
nothing, because `coverAround` (`pages/island/model/tile-cover.ts`) bars every
stand-in that contains a tile of the last complete selection.** Near the eye
every ancestor up to the root contains one, so nothing stands in, and the globe
at `R − 1500` (`island-scene.ts`, Lambert `SEA_COLOUR`) shows through, walled by
the neighbours' skirts. Not a geometric gap: every hole closes with no change but
tiles arriving, and settled frames have no hole pixel.

- **No outgoing tile is removed before its replacement.** The last complete
  selection (`shown`) is drawn until the new one is wholly in hand; `evict`
  only acts past 900 variants and never on a variant `shown` or the selection
  stands on. What is missing is the *incoming* ground, never the outgoing.
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
| ------------ | --------- | --------------------------- | ---------------------------------- |
| 220.1 → 200° | 42        | 9 / 20 / 42                 | 29,508 → 8,808 → 8,904             |
| → 180°       | 53        | 11 / 29 / 53                | 11,460 → 8,396 → 8,444             |
| → 160°       | 39        | 10 / 23 / 39                | 15,200 → 7,632 → 7,656             |
| → 139°       | 42        | 11 / 30 / 42                | 26,728 → 6,408 → 6,412             |

(Pixel counts include ~6–9k of real sea at the horizon, the settled floor.)
`a` frames show Vova's shape: a dark-blue block lower-left, on the side turned
into, walled by skirts.

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

## Left (not done)

- Vova's #1 pose re-shoot and the #0 seam sweep (Italy / Japan / Florida) of the
  original brief: not started.
- Fix options for the lead (none tried): admit a stand-in that contains a shown
  tile but draw it only outside the shown tiles' footprint (a stencil or depth
  pre-pass of `shown`, or the stand-in pushed slightly below so shown wins);
  or widen the frustum margin so a turn lands on tiles already selected; or keep
  the previous selection's tiles beyond the frustum held and drawn.
