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

## Run 3 — looked at in the page (no code change)

**Verdict: the descent works; the turn is better but still has holes, and what
fills them is a flat plane.** Not merged-ready as a fix for the turn holes.
Frames in `b3-lod0/`, drivers `b3-lod0/drivers/*.txt` (run from `tmp/look/`;
exports built at aa2883f3 = before, 8773b62c = after).

**Why holes remain: the stand-in near the eye is a root tile, and its cut drops
whole coarse triangles.** On a turn only the shown tiles and the roots are in
hand, so the stand-in is the level-2 root `px/2/2/3`, cut around ~290 shown
tiles of levels 6–17. Its 64-cell lattice is level-8 fine (~40 km triangles);
`indicesOutside` drops a triangle when its middle falls in any `except` tile, so
a 40 km triangle goes for a 100 m shown tile, and the globe shows through the
rest of it — the straight-edged blue wedges below. Where the middle falls
outside, the triangle stays drawn over the finer tiles (overlap). Tile-level
accounting cannot see this, which is why the unit tests and the plain replay
both read 0.

**Holes replay** (Node, `holes.ts.txt`, turn from 220.1° at
`#0@38.30756,15.90432,546`, shown + roots in hand; old = d2592e12 `coverAround`,
new = `finestCover`; "mesh" = new cover with the root's real cut lattice):

| turn to | not in hand | old uncovered | new uncovered | new mesh: tiles with a hole / cells drawn twice |
| ------- | ----------- | ------------- | ------------- | ----------------------------------------------- |
| 200°    | 38          | 38            | 0             | 8 / 3,152                                       |
| 180°    | 82          | 82            | 0             | 14 / 2,384                                      |
| 160°    | 115         | 115           | 0             | 16 / 1,808                                      |
| 139°    | 157         | 157           | 0             | 16 / 1,196                                      |

(Old counts equal b3-seams'. Cells are level+3 of each selected tile.)

**Fast turn in the page** (8 × −12°, one frame each, 1440×900; hole pixels
(7,41,78) ±4 below row 558): before → after.

| frame | turn02 | turn03 | turn04 | turn05 | turn06 | turn07 | turn08 | hold +100 | +200 | +300 on |
| ----- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | --------- | ---- | ------- |
| old   | 32k    | 85k    | 81k    | 149k   | 213k   | 198k   | 264k   | 116k      | 14k  | 0       |
| new   | 0.5k   | 9k     | 40k    | 54k    | 53k    | 48k    | 51k    | 48k       | 3k   | 0       |

3–5× fewer hole pixels, not none. `turn-pairs-old-new.png`, `turn08-*.png`: the
blue the root does fill shows as a flat, unshaded olive plane at the root's
coarse height with the fine ground standing up out of it — a big, visible
stand-in, not ground a player would mistake for terrain.

**Fast descent** (#0 over Calabria, 40 frames 20,000 km → 546 m, geometric,
960×600; `descent-old.png` / `descent-new.png`, frames at 1,446 / 104 / 22 / 7.6
/ 2.6 / 1.2 km / 546 m, then held): after keeps fine relief under the eye all
the way down; before shows coarse flat slabs in the foreground at 2.6 km, 1.2 km
and 546 m until the hold. After has one defect: dark-blue slits along a cut edge
at 923–546 m (18–133 px, gone 500 ms into the hold,
`descent-new-546m-crack.png`) — cut edges have no skirt.

**No console errors** in any run (only three's WebGPU-unavailable warning), so
the shared-attribute dispose holds. No z-fight flicker seen in the frames. The
panel's `tiles` line is not in `innerText` under `?play`, so levels were read
from the frames, not the panel.

**Cost** (Node, per change of a stand-in's `except`, one surface; land+sea
doubles it): `finestCover` 1–3.5 ms; `indicesOutside` for the root stand-in
13–19 ms at 527/546 m, 9–13 ms at 13 km. While loading, every arriving tile
changes `except`, so that rebuild (plus an index upload) lands on most frames —
over a 16 ms frame on its own.

**Not fixed, because no small fix is safe.** Dropping only triangles wholly
inside `except` closes the wedges but draws the 40 km root triangles over the
fine ground near the eye — the hiding `coverAround` was built to avoid. The real
options are the lead's: draw stand-ins behind finer pieces (depth offset or
stencil of the finer pieces, b3-seams' first option) so the cut can be
conservative; or hold a finer ring of ancestors (e.g. level 6–8 around the eye)
so the stand-in's lattice is finer than what it is cut around; and cache or
cheapen the cut rebuild.

## Run 4 — stand-in ring, drawn behind (809a61b6, 2nd commit after it)

- **(a) Ring**: `standInsOf` (`model/tile-cover.ts`) — each selected tile's
  ancestor `STAND_IN_DEPTH = 3` up (a lattice is 6 levels finer than its tile,
  so the stand-in's cells are the selected tile's level+3). `tileView` asks for
  them unstitched (flat levels, like roots) in `want`'s new `first` list, which
  `tilePool.want(first, rest, eye)` queues ahead of the rest; `standing()` keeps
  them from eviction. A fixed level 6–8 ring would sit 9+ levels above the
  level-17 tiles at 546 m, so L−3 it is. Extra fills (Node,
  `drivers/ring.ts.txt`, Calabria, heading 220.1°): 527 m 294 selected → +26 (+9
  %, levels 3–14); 13 km 283 → +18 (+6 %). A turn's new stand-ins: 3 / 4 / 7 / 8
  / 9 / 12 / 17 for turns of 12–96° (vs 19…189 new selected tiles).
- **(b) Behind**: `groundLighting().standIn.{land,sea}` — same colour and
  lights, `depthNode` view depth × 1.03 (`STAND_IN_PUSH`), so a finer tile wins
  where they overlap. `tileMeshes` draws cut meshes in them. `indicesOutside`
  now drops a lattice cell only when wholly inside `except` tiles (a per-cell
  mask; a tile finer than a cell cuts nothing) **and** every neighbour inside
  the stand-in is cut too: a one-cell rim stays under the cut edge, behind the
  finer tile, because a cut edge has no skirt — exact cuts alone left curved
  dark slits along ridges in the turn (first build).
- **(c) Cost**: no cache needed — the mask makes the cut linear in the lattice.
  Root cut around 290 tiles (`drivers/cut-bench.ts.txt`): 0.9 ms median / 2.1
  p90, was 13.5 / 17.4 ms; level-9 stand-in 0.4 / 1.0, was 2.2 / 2.6.

**Fast turn in the page**, built at 809a61b6 (exact cut, before the rim), same
driver, blue px below row 558 / whole frame:

| frame                 | turn02 | turn03 | turn04 | turn05 | turn06 | turn07 | turn08 | hold +100 | +200 | +300 | +400 on  |
| --------------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | --------- | ---- | ---- | -------- |
| old (aa2883f3, run 3) | 32k    | 85k    | 81k    | 149k   | 213k   | 198k   | 264k   | 116k      | 14k  | 0    | 0        |
| run 3 (8773b62c)      | 0.5k   | 9k     | 40k    | 54k    | 53k    | 48k    | 51k    | 48k       | 3k   | 0    | 0        |
| run 4 below row       | 0      | 0.1k   | 0.2k   | 0.15k  | 0.13k  | 0.8k   | 1.1k   | 1.1k      | 1.6k | 0.3k | 0        |
| run 4 whole frame     | 2.9k   | 3.6k   | 4.5k   | 4.4k   | 4.2k   | 4.5k   | 4.4k   | 4.5k      | 5.0k | 3.6k | 3.2–3.4k |

Whole-frame blue in the turn (4.4k) ≈ the settled horizon sea (3.2k at hold,
1.6k at the opening heading). **Looked** (`run4-turn04.png`, `run4-turn08.png`):
relief everywhere, no flat slab, no wedge; what blue is left below the horizon
is two or three thin curved slits along ridge backs — the skirtless cut edges
the rim commit closes. No z-fight seen, console clean (only the
WebGPU-unavailable warning).

**Verdict: the turn's holes and the slab are gone; the slits are fixed in code
but not yet looked at.**

## Left (for the next agent)

0. **Re-run at the rim commit** (export already built in `sites/vova/out` of the
   run-4 worktree, else `pnpm build vova`): `lod0.ts spin` and `descent`,
   `blue.py <dir> 0.62`; expect turn below-row blue ≈ 0; look for the rim
   showing over finer ground at 546 m (push 3 % vs a rim standing higher than
   the finer tile beside it) and the descent's 923–546 m slits. Frames →
   `run4-*.png`.

1. **Sims not re-run** (context ran out). Rebuild `tmp/descent-sim.ts` from run
   1's description (real `selectCubeTiles`, `nearestFirst`, reselect at 2 % of
   height, nearest-first pool queue dropping stale queued, 25 ms fill, 4 s at
   20,000 km then 1.5 e-folds/s; `RATE=1.5 HOLD=8`), swap in `finestCover`, and
   record level under the eye vs time before (d2592e12) / after. For drawn level
   under the eye use pieces whose key holds the point and no `except` does (as
   `tileView.levels` now does).
2. ~~Holes replay~~, ~~cut cost~~, ~~look in the page~~: run 3 above.
3. The turn's remaining holes and the flat stand-in: a lead's call (run 3).
4. `POOL_SIZE` 3–4 trial and what a coarser coast (`COAST_FINER`) would save —
   not started; `COAST_FINER` is the lead's look call.
