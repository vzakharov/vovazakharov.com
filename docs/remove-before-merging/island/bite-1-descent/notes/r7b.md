# R7b — pinholes at tile edges

Scratch: `$SCRATCH/r7b/run.sh <out> [screens]` (`SRC=<dir with island/>` to
build a diagnostic copy) builds in `$SCRATCH/r7/tree` and plays.

## Cause, verified (two diagnostic builds, scratch only)

- `diag-skirt`: land grid magenta, land skirt cyan. Phone orbit dashes and the
  desktop 1 000 km ticks are both **magenta — the land's grid**, never its
  skirt.
- `diag-fade`: sea forced opaque, painted yellow by `1 − opacity`. The phone
  orbit dashes turn **yellow**: they are the sea's own edge fade, not holes.
  `opacity = smoothstep(0, 1.5·fwidth(thickness), thickness)` reads `behind`
  from the depth copy; where the land floor jumps across a tile edge (a step at
  a T-junction, a skirt, the edge of the tiles that carry land) `fwidth` spikes
  to the jump, so a 2×2 quad on the edge goes see-through over floor tens to
  thousands of metres down, which the land lights pale. R6 clamped the colour
  band against exactly this; the opacity was left unclamped.
- Desktop 1 000 km ticks are a different thing: one-pixel columns over land
  where the sea (yellow in `diag-fade`) shows through a crack in the land —
  pinholes in the land surface, which vertical skirts seen from overhead
  cannot cover. The flare is the fix for those.

## Fix

1. `tile-fill.ts`: each skirt's bottom ring lies one cell outward of its
   border vertex (diagonally at corners) as well as `skirtDepth` down, so from
   overhead it overlaps the neighbour. Vertex order and count unchanged
   (`colour-heights.ts` untouched).
2. **Not done — proposed, outside the granted paths.** The phone dashes'
   cause is `ui/ground-lighting.ts`'s opacity fade. Candidate: cap the fade's
   width (`min(1.5·pixel, SHALLOW_THINNEST)` or the −20 m floor stop), the
   way R6 clamped the band, leaning on MSAA (`antialias: true`) for the coast
   edge. Trade-off to check in frames: from ~10 km up the coast's soft fringe
   narrows to MSAA's. A per-axis or quad-parity derivative was considered and
   rejected: a coast pixel and an edge-jump pixel look the same to `fwidth`.
   Removing the jumps instead means stitching T-junctions (worker/quadtree).

## Status

- [x] flare + test pushed (typecheck, eslint, prettier, 66 terrain/island
  tests green)
- [ ] play run with the flare, after frames into `notes/r7/` — not run
  (context budget)
- [ ] the shader fix above, operator's/orchestrator's call
