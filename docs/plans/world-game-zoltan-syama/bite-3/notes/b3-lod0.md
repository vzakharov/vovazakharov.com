# b3-lod0 — #0 stays on level-2 tiles all the way down

## Cause

The selection is right; the **drawn** cover is stuck. `tileView` draws the last
selection wholly in hand (`shown`) and, through `coverAround`, lets no selected
tile inside a shown tile draw until the whole current selection is in hand.
Vova's descent (the .mov, read at 1 fps) goes 20,000 km → 530 m in about 7 s, so
a new selection is made nearly every frame (2 % of height) and none is ever
wholly in hand before the next replaces it. `shown` stays the opening's 51
level-2 tiles, which contain the whole view, so the panel reads `tiles 2 (2–2)`
until the eye stops and one selection completes.

#0 shows it and #1 does not because #0 selects 3–5× as many tiles (Earth's
coast-rich view, `COAST_FINER` refining every tile astride the coast), so a
selection takes 3–5× as long to fill. Per-tile fill cost is the same:

| world | pose (sheet) | selected (levels) | fill ms median / p90 (Node) |
| ----- | ------------ | ----------------- | --------------------------- |
| #0    | 2,414 km     | 164 (3–5)         | 22 / 28                     |
| #1    | 2,414 km     | 85 (2–5)          | 15 / 23                     |
| #0    | 170 km       | 129 (6–8)         | 26 / 43                     |
| #1    | 170 km       | 27 (3–6)          | 23 / 27                     |
| #0    | 13 km        | 350 (6–12)        | 31 / 49                     |
| #1    | 13 km        | 72 (5–10)         | 34 / 43                     |
| #0    | 527 m        | 338 (7–17)        | —                           |
| #1    | 527 m        | 110 (6–15)        | —                           |

At 2 workers × 2 in flight and ~25 ms a fill, a fresh #0 selection near the
ground takes ~4 s to fill (#1: ~1.4 s): Vova's "small but noticeable" wait.

## Reproduction (headless)

`tmp/descent-sim.ts` (throwaway, not committed): the real `selectCubeTiles`,
`neighbourLevels`, `nearestFirst` and `coverAround`, tile-view's reselect rule,
the pool's queue (nearest first, stale queued dropped, in-flight kept), a fixed
25 ms fill, the eye settled at the 20,000 km opening for 4 s, then Vova's path
at 1.5 e-folds of height a second.
`RATE=1.5 HOLD=8 node --import tsx tmp/descent-sim.ts <world> 25 2`.

Before (base ecd9ceca), drawn levels over the descent:

- #0: `2–2` from 20,000 km to 528 m; whole selection (7–17) drawn 3.6 s after
  the eye stopped. Only 11 of 142 selections ever completed.
- #1: a selection completes near 200 km, `3–6` thereafter; 6–15 drawn 0.8 s
  after stopping.

## Fix (committed)

`coverAround` settles each overlap on its own instead of all-or-nothing: a shown
tile gives way to the selected tiles inside it once each is in hand or stood in
for by a held tile finer than the shown one; a selected tile holding shown ones
draws once in hand. Beyond the shown tiles, as before. Four tests beside it.

After, same sim: under the eye, #0 draws 3/4 at 4,000 km, 6/7 at 440 km, 8 at
200 km, 9 at 100 km (max drawn level tracks the selection's to 12), against 2
before. No overlapping tiles drawn (checked every 0.5 s). `coverAround` costs
0.87 ms median, 4.4 ms p99 a frame on #0 (0.31 / 1.7 on #1).

## Left

- **Below ~10 km the fills still cannot keep up** with that descent (queue
  300+), so under the eye stays at the level-8 stand-in until the eye stops. The
  stand-in hides finer tiles already held under it, because `coverOf` draws a
  stand-in whole. Next step, designed but not written: one recursive "finest
  whole cover" over the quadtree of selected and shown tiles — a region draws
  its children's covers when all are whole, else its own held tile, else its
  children's partial covers — which subsumes `coverOf` and `coverAround`
  (stand-ins never a strict ancestor of a shown tile). Then the tiles nearest
  the eye, filled first, show as they land.
- The tile count itself: `COAST_FINER = 2` costs #0 3–5× the tiles of #1. More
  workers (`POOL_SIZE = 2`) or a coarser coast rule cut the 4 s settle; neither
  tried.
- Frames step (shots at 170 km / 13 km over Italy, fill-time budgets) not done.
- `b3-seams`: the fix changes what draws while loading, not the stitched
  variants; mixed covers fall back to unstitched variants (skirts) more often
  now, so seams _while loading_ may be seen more, not fewer.
