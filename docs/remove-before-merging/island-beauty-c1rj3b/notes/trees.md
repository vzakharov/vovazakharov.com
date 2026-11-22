# Trees — hand-over note

Branch `claude/island-beauty-trees`, cut from `claude/island-beauty-c1rj3b`.
Everything is under `src/island/pages/island/`.

## What stands where

- **`model/forest-cover.ts`** — `forestCover(seed, site)`, 0…1: how much of a
  place is under trees. Patch noise of four wavelengths (26 km → 410 m), gated
  by sand (thinning from a 0.15 share of sand, bare from 0.8), by height
  (thinning to a ragged treeline at `TREELINE` 850 m ± 60) and by slope
  (thinning from 30°, bare past 42°). `tileSand(coast, tileMesh)` is the
  terrain's `sandAt` per tile vertex and `tileCover(seed, tileMesh, sand)` the
  cover, each patch octave fading out between 64 and 4 of the tile's cells a
  wavelength, so a tile differs from its parent by a share of an octave. The
  worker ships both as vertex attributes on every land tile: `cover` and `sand`
  (`COVER_ATTRIBUTE`, `SAND_ATTRIBUTE` in `model/cover-attribute.ts`).
  `coniferShare(height)` and `stature(height)` are the two other things height
  decides.
- **`model/undergrowth.ts`** — `undergrowthIn(cell, ground)`: bushes (under
  the forest, thinly in the open) and tufts of dune grass (on sand above 3 m),
  6×6 spots per finest cell, so drawn to 305 m. Two more kinds in the same
  view; meshes in `ui/undergrowth-meshes.ts`.
- **`model/tree-placing.ts`** — `treesIn(cell, ground)`: the trees of one cube
  cell, a pure function of the world number, the cell and the ground. Each cell
  has 4×4 jittered spots; a spot holds a tree where its rolled chance is under
  `forestCover` there. Five tiers: tier `t` uses cells of cube level `18 − t`
  (38 m · 2^t) and is drawn to 8 cells (305 m … 4.9 km).
- **`ui/tree-meshes.ts`** — the two kinds at four details, built in code: unit
  height, foot at the origin, vertex colours.
- **`ui/tree-nodes.ts`** — what the vertex shader does to a tree: shrinks it to
  its foot over the last 35 % of its tier's reach, widens a coarse tier's tree
  (to 3× at most) between 15 % and 35 % of its own reach, and bends it in the
  wind — gusts crossing the ground, seen within 400 m.
- **`model/forest-floor.ts`** — `floorIn`: under each tree of every tier a
  `shade` (a disc as wide as the crown over open ground, half that in closed
  forest, taking 55 % to 40 % of the ground's light at the trunk), and fallen
  `log`s under cover, in the finest cells. Both lie along the slope. The ground member paints the
  floor's colour and the flat canopy shade; these are what it cannot place.
- **`ui/tree-view.ts`** — per frame: lists the cells in reach, rolls missing
  ones for 3 ms, lays instances out again every 7 m the eye moves.
  **`ui/tree-stands.ts`** holds the `InstancedMesh`es (kind × detail) and their
  materials; the shade's multiplies the ground behind it and writes no alpha.
  Its strength is the instance colour and its fall-off is computed in the
  fragment shader from the distance to the trunk: the disc's vertex colours
  reach the shader in the lab (`tmp/shade-lab`, not committed) and come out
  black in the built scene, for a reason not found.
  **`ui/tree-rolled.ts`** turns a cell's plants into frames and tints.
- **`lib/world-ground.ts`** — `coastOf`, `groundOf`, `treeGround`, `SEA_LEVEL`,
  out of `island-scene.ts` to keep it under 400 lines.

## Numbers others depend on

- Budget per kind, six kinds: 600 near, 4,400 mid, 12,000 far, 12,000 least;
  the four kinds that are no trees hold 4,400 at most at any detail.
- `treeView.drawAs(look)`: plain draws none. Fine: near ≤ 80 m, mid ≤ 320 m,
  far past it. Swift: no near, mid ≤ 60 m, far ≤ 220 m, `least` past it (20
  triangles a broadleaf, 24 a conifer stand), bushes and grass gone by 110 m,
  no shade or logs. Fine draws shade and logs within 140 m.
- Closed canopy from 2 m (`treeView.tally()`): fine 20,660 plants in 1,218k
  triangles; swift 17,694 in 480k. From 400 m up: 11,682 plants, 485k and 280k.
- The worker's tile fill costs about 1.07× what it did without `cover`.
- Trees have no collision and cast no shadow.

## What is not done

- Rolling a full surround at closed canopy takes about 1.3 s of main-thread
  time, spread at 3 ms a frame: after a jump the far trees arrive over a second
  or two. Moving it to the tile worker would remove that.
- The placed trees close a canopy to about 400 m and cover under half the
  ground to 1.2 km, a few per cent past it: the ground's own canopy colour has
  to carry a forest from there.

## Left, each with its first step

The lead's verdicts these answer are on the lead branch as
`frames/0012-merge-5-*` and `frames/0014-merge-7-*`.

- **A forest from 300 m reads as a lawn with bushes.** Placed trees thin with
  distance and stop near a kilometre. First step: read how `tree-placing.ts` shares
  the cover among the tiers, which is where the coarse ones come out sparse,
  and make the farthest drawn tier hold the whole cover (crowns touching) and let only its mesh get cheaper (`least`), then end it where a
  crown falls under ~2 px rather than at a fixed radius, and agree tone and
  distance with the ground's canopy texture past it.
- **The forest ends at the dune belt along a ruler-straight line.** First step:
  in `forestCover`, add noise of 100–200 m to the sand thresholds (0.15 and
  0.8) and let conifers and bushes thin through the band.
- **Nothing should grow on shore rock.** The lead branch has
  `shoreAtSphere(coast, p, height)` → `[sand, rock]` and `tileShore`. First
  step: rename `TreeGround.sandAt` to a `shoreAt` returning both (wired in
  `lib/world-ground.ts`), multiply `coverFrom`'s standing by `1 − rock`, hand
  `tileCover` the tile's `rocky`, and place nothing where rock is over ~0.3.
- **Crowns are faceted "turtle shells".** First step: in `tree-mesh-parts.ts`
  blend each crown vertex's normal toward the crown's own sphere normal.
- **Trunks are plain tan sausages; a crown's underside is a black slab.** First
  step: darken `BARK` toward grey-brown with a slow tone along the height and a
  flare at the base; start the lowest crowns above 4 m and give undersides a
  dim green instead of the lit colour's zero.
- **Fine draws 1.2M triangles near the ground against a budget of ~800k.**
  First step: draw fine's farthest tier with the `least` mesh, as swift does,
  and count again with `treeView.tally()`.
- **What trees cost on the operator's M2 Pro**: fine 79 ms and swift 68 ms a
  frame on a land view against plain's 13. The speed member's `?without=trees`
  switch says how much of that is the trees.
