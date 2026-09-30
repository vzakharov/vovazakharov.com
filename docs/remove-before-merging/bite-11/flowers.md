# Bite 11 — package "flowers" hand-over

## Stash recovery (first flowers agent)

A `git stash` of the shared tree took other agents' edits; two files needed
their owners (`mushroom-room.ts`, package 2; `keyboard.test.ts`, package 4).
Their pre-stash edits are in `stash@{0}` ("WIP on
claude/mushroom-game-syama-lbirv7: 71165ac"); recover with
`git merge-file <working copy> <(git show 71165ac:<path>) <(git show stash@{0}:<path>)`,
then drop the stash.

## Done

- Step 1, sight against the world (this commit):
  - `flowerInSight` tests the seat against the world's edges (`0..camera.world`,
    `0..height`) by the wingspan; no control's tap circle.
  - `airGrid` spans `0..camera.world` and keeps off no control; the away spots
    stand at `−reach` and `camera.world + reach`.
  - Butterflies' `slowest` 2 → 4 (`model/flight-habits.ts`, outside the
    package's list, owned by no package). Cause of the red catch test: a
    butterfly's flight past `slowest` strides takes `slowest` times its pace
    and simply flies faster, and with flowers across the world a leg runs up
    to 12–14 strides (it was ≤ 6.6 across the tablet's screen), so the long
    ones flew twice as fast as before. The world is twice the tablet's screen,
    so twice the cap keeps the fastest crossing no faster than the tablet's
    was. Caught share now 0.80–0.95 on every screen (≥ 0.7 asserted).
  - `fliers.test.ts`: `AIR_UNMET` (small phone) removed — the world's air grid
    now seats all ten apart there.

## Step 2 (the flower cap becomes room) — in progress, not committed

`flowers-step2.patch` beside this note holds it, and the same edits stand
uncommitted in the tree (they do not type-check yet):

- Done in the patch: `FLOWER_LIMIT` and `Plot.seededFlowers` gone
  (`pollen.ts`, `sown`); the `plant` action is `{ kind: 'plant', shape }` and
  plants whenever the picker has a seed (`game.ts`, the `plant` case and the
  `Action` row only); `planter.plant` dispatches without reading the stand;
  `takesFlower` is `roomIn(stand)(foot)`; `perchSight` returns no
  `seededFlowers`; `tufts.ts`: `flowersLeft` gone, `tendTufts` bounded by
  `round(camera.world / 1000 × TUFTS_PER_1000PX)` and tries x across
  `0..camera.world` (random and grid), `plantableIn` calls `roomIn(stand)`
  once, `bareToTap` tests no control (a tuft a pan slides under a control is
  the control's to tap there, the grass's again one pan on — the same
  acceptance as the plan's caps under buttons). Model tests rewritten:
  `planting.test.ts` / `pollen.test.ts` plant past 40 flowers, `swarm.test.ts`
  still plants in a run's second half; `seededFlowers` stripped from every
  test's sight literal. Those three model files pass.
- Left for step 2:
  - `meadow-scene.ts:81` still sets `seededFlowers: 0` on its opening
    `Sight` — drop that line (package 4's file; the one minimal edit).
  - `tufts.test.ts`: imports `FLOWER_LIMIT` and `flowersLeft`; its tests of
    "no more tufts than flowers left" and "fills to FLOWER_LIMIT" (≈ lines
    106–110, 154, 190, 305–317) become density-over-the-world and
    plant-until-no-tuft.
  - `flower-plots.test.ts` `plantedOut` now plants until no slot is offered;
    uncapped, with `perchSight` re-run per planting over `BED_VISITS` 200,
    the file ran past 10 minutes and was killed. It needs a cheaper loop
    (one `roomFor` per planting, or fewer visits for the planted-out tests)
    before it can be judged.
  - **`TUFTS_PER_1000PX` (52) was never the binding bound** — the cap's
    `flowersLeft` (≤ 7 at the opening) was. Over the world it would allow
    ~112 bare tufts on the tablet. Measure how many actually grow (reach
    apart and room thin them) and pick the density so a screen shows about
    as many as before (~6 per 1000 px) — a visible call, to report.
  - Run `tufts.test.ts`, `flower-plots.test.ts`, `flower-touch.test.ts`,
    `flower-picker.test.ts`, `ground-seam.test.ts`, `game.test.ts`, then
    `pnpm typecheck`, commit, delete the patch.

## Left

Steps 3–5 of the package, and the rest of step 2 above.
