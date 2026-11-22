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
- **`ui/tree-meshes.ts`** — the two kinds at three details, built in code: unit
  height, foot at the origin, vertex colours.
- **`ui/tree-nodes.ts`** — what the vertex shader does to a tree: shrinks it to
  its foot over the last 35 % of its tier's reach, widens a coarse tier's tree
  (to 3× at most) between 15 % and 35 % of its own reach, and bends it in the
  wind — gusts crossing the ground, seen within 400 m.
- **`ui/tree-view.ts`** — six `InstancedMesh`es. Per frame: lists the cells in
  reach, rolls missing ones for 3 ms, lays instances out again every 7 m the eye
  moves.
- **`lib/world-ground.ts`** — `coastOf`, `groundOf`, `treeGround`, `SEA_LEVEL`,
  out of `island-scene.ts` to keep it under 400 lines.

## Numbers others depend on

- Budget: 13,000 instances at most per kind, four kinds (600 near ≤ 80 m,
  4,400 mid ≤ 320 m, 8,000 far). Closed canopy underfoot draws about 9,000.
- The worker's tile fill costs about 1.07× what it did without `cover`.
- Trees draw in the fine look only: `treeView.setShown(fine)`.
- Trees have no collision and cast no shadow.

## What is not done

- Rolling a full surround at closed canopy takes about 1.3 s of main-thread
  time, spread at 3 ms a frame: after a jump the far trees arrive over a second
  or two. Moving it to the tile worker would remove that.
- The placed trees close a canopy to about 400 m and cover under half the
  ground to 1.2 km, a few per cent past it: the ground's own canopy colour has
  to carry a forest from there.
