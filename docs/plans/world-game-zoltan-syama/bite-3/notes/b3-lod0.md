# b3-lod0 — #0 stays coarse while the view loads

## Cause (run 1)

Selection is right; the **drawn** cover lags. #0 selects 3–5× the tiles of #1
(`COAST_FINER` refines every tile astride the coast), so a selection takes 3–5×
as long to fill at the same ~25 ms a tile:

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

At `POOL_SIZE = 2` × 2 in flight, a fresh #0 selection near the ground takes ~4
s to fill (#1: ~1.4 s). Run 1 (d2592e12) let shown tiles give way per tile.

## Run 2 — finest cover, stand-ins cut (0ffc6b53)

**The note's recursive "finest whole cover" alone would not have helped**: drawn
whole, a stand-in still hides every finer tile under it, and a recursion that
picks the finest whole subtree draws exactly what `coverOf` drew (the outermost
needed stand-in). So the stand-in is drawn **cut**:

- `finestCover` (`model/tile-cover.ts`) replaces `coverOf` and `coverAround`.
  Over the tree of selected and shown tiles: a selected tile in hand (or a shown
  leaf) draws itself; else its children's covers when each is complete; else,
  when held, itself minus the outermost finer pieces under it (`except`); else
  its children's partial covers for an ancestor to finish. Roots are always
  held, so **no part of the selection is ever undrawn** — this also answers
  b3-seams' turn holes (`coverAround` refused any stand-in containing a shown
  tile; now the root or finest held ancestor draws, cut around the shown tiles).
  Outgoing shown tiles stay drawn until replaced, as before.
- `model/piece-indices.ts` `indicesOutside`: the held mesh's triangles whose
  middle lies in no `except` tile (vertex → lattice spot via `borderLoop`).
  `tile-meshes.ts` builds a cut mesh per (variant, cut) as a second geometry
  sharing the whole mesh's attributes; disposing it deletes the shared
  attributes from it first, so only its index buffer is freed.
- Tests: 10 for `finestCover` (incl. a 200-run random property test: no overlap,
  no hole; and the turn case: old set in hand, turned selection not → covered),
  3 for `indicesOutside`.

Known limits: an `except` tile finer than the stand-in's lattice cell is cut by
triangle middles, so the stand-in overlaps it by under one lattice cell. Cut
edges have no skirt of their own; the finer neighbours' skirts hide the step. A
root stand-in's cut is rebuilt whenever its `except` changes (each tile arrival
while loading) — cost not yet measured.

## Left (for the next agent)

1. **Sims not re-run** (context ran out). Rebuild `tmp/descent-sim.ts` from run
   1's description (real `selectCubeTiles`, `nearestFirst`, reselect at 2 % of
   height, nearest-first pool queue dropping stale queued, 25 ms fill, 4 s at
   20,000 km then 1.5 e-folds/s; `RATE=1.5 HOLD=8`), swap in `finestCover`, and
   record level under the eye vs time before (d2592e12) / after. For drawn level
   under the eye use pieces whose key holds the point and no `except` does (as
   `tileView.levels` now does).
2. b3-seams' `holes.ts.txt` replay: its `roots` set uses numeric faces, so it
   holds no root — use `FACES`. Count a selected tile uncovered if any of its
   level+3 cells is drawn by 0 pieces. Expect 0 after.
3. Measure `indicesOutside` + cut rebuilds per frame on #0 at 13 km / 527 m.
4. `POOL_SIZE` 3–4 trial and what a coarser coast (`COAST_FINER`) would save —
   not started; `COAST_FINER` is the lead's look call.
5. Look at it in the page (`/preview`): cut stand-ins near the eye on a fast
   descent and a turn at `#0@38.30756,15.90432,546,220.1,25.8`.
