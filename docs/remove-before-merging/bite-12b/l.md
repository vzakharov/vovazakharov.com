# Package L — hand-over note

## Done

- **L1 — `tufts.ts` split** (spec § 7), no behaviour change.
  `ui/scene/tuft-tap.ts` holds `TUFT_REACH`, `tuftReach`, `tuftAt`,
  `bareToTap` and `middleOf` (now exported: `Grass.inView` reads it);
  `tufts.ts` keeps growth, `plantableIn`, `tendTufts`, `leaveTufts`,
  `shownSprouts`, `tuftUnder` and `Grass`. The `tuftAt` cases moved to
  `tuft-tap.test.ts`; `tufts.test.ts`'s `faultsOf` and `shownSprouts` cases
  import `bareToTap`/`tuftAt` from `tuft-tap`. No importer outside the two
  test files changed: `hit-areas.ts`, `planter.ts` and `meadow-scene.ts`
  import only what stayed in `tufts.ts`.

- **L2 — the lawn by plane cells** (spec § 7). New `ui/scene/lawn.ts`:
  4 × 4-unit cells (`CELL`), `TUFTS_PER_CELL` = 14 uniform in the cell from
  `mulberry32(cellSeed(seed, cell))`; `liveCells` within
  `D_SEE + PALE_SPAN + CELL·√2` of the eye's cell (~80 cells, ~1100 tufts);
  `LiveLawn.round(eye)` regrows only on a cell crossing, keeping the cells
  that stay. `Sprout`, `sproutOn`, `regrowTufts` moved there (`tufts.ts`
  re-exports `Sprout`). `growTufts`/`grownTuft`/`mostTufts` and their
  constants are gone. The lawn's seed is `Grass`'s growing stream's first
  draw, so `meadow-scene.ts` is untouched. `PALE_SPAN` is now exported from
  `repaint-queue.ts` (one keyword, P's file).

## Decided in L2

- **Tending (the 32–76 ms risk):** `Grass` tends only `tendedIn(view)`:
  live tufts within `D_SEE + PALE_SPAN` past the culled near ones (each
  with `TEND_STEP` to spare) and within half a screen + one screen
  (`TENDED_SCREENS`) of the heading. It re-tends on `follow` once the eye
  has stepped `TEND_STEP` (0.5) or turned half a screen from where it last
  tended, and on every `tend` (sow) as before. Estimated ~370 tufts on a
  sideways tablet (3 of a turn's 4 screens), ~90 on a phone: 15–35 ms per
  re-tend on the tablet in a forest, ~3 a second while walking. Unmeasured.
- **Drawing:** a tuft is placed with `placedAt(view, foot, 0, CLUMP_DISTANCE)`
  and sized by the screen row it stands on (`tuftSizeAt`, `tuftOn`'s old
  formula), so a tuft behind the opening eye draws right; `bedPlace`'s
  `zoom` (opening distance `gathered(foot).y`) is not used for tufts.
- **The rules still read the opening layout:** each sprout's `tuft` is laid
  on the opening layout (`standingOn`) for `bareToTap`, as before. Grass
  away from the opening crop is judged by it, so it mostly does not stand
  until L3 judges from the current eye.
- `leaveTufts` takes `grownAt(foot)` (the lawn's cell there) instead of the
  grown list, so a pulled flower on a cell not live leaves no duplicate.

## L3 (in progress)

- **L3a — the band only for the child; the bed re-stands.** `groundFor`
  no longer holds a flower to the band; `inFlowerBand(foot)` does, and
  only `roomIn`/`takesFlower` (the child's planting, so `plantableIn`) read
  it. A bee's ring (`roomFor`) and a standing flower (`standingFlowers`)
  keep to no depth band. At the opening nothing stored changes standing (a
  planted flower was always planted in band). `FlowerBed.paint` stands
  each flower again after `drawFlower` sizes the head (S1's note).
  `flower-plots.test.ts`'s "off the ground" band assertion went: a bee's
  flower may now stand with its foot past the screen's foot or the band.

## L3b (wave 4, `wt/l3b`)

- **`lawn.ts`'s overlap**: `Lawn = Seeded & Pick<Stand, 'layout'>`;
  `pnpm type-overlap` clean.
- **Ring slots on the plane — cannot hold as written; not built.** Measured
  over the seeded beds of the first 40 visits at 1180 × 820 (348 parents,
  plane distance 5.1–12.0 from the opening eye, every one of the 18 slots),
  today's ring foot against a fixed plane offset `(slot.x · size · A,
slot.z · size · B)`:

  | Offset                          | screen error, tufts (`tuftSizeAt`) p50 / p90 / worst | plane error, units p50 / p90 / worst |
  | ------------------------------- | ---------------------------------------------------- | ------------------------------------ |
  | A = `SPREAD`, B = 1             | 1.9 / 5.4 / 10.5                                     | 0.31 / 0.83 / 1.28                   |
  | A = `SPREAD`, B = 1.5 (best B)  | 1.8 / 4.7 / 7.9                                      | 0.28 / 0.72 / 1.12                   |
  | rotated to the parent's azimuth | 2.1 / 6.2 / 14.1                                     | 0.31 / 0.74 / 1.35                   |
  | rotated, depth × (\|p\| / CD)²  | 1.9 / 5.7 / 13.5                                     | 0.28 / 0.70 / 1.39                   |

  Half a tuft is 0.5 on the first scale, ~0.54 units (half the lawn's
  tuft spacing, 1 / √0.85) on the second. Two causes, both of today's ring
  being laid in the opening's `Ground`: depth on the plane is
  `(y / CLUMP_DISTANCE)²` per `z` (0.35 at the bed's nearest parent, 1.93
  at its farthest — no one B fits both), and across is `Ground` x, which
  for a parent off the opening axis (the seeded bed spans the whole world,
  gathered azimuth to ~±0.5) is skewed into depth on the plane. Near-axis
  parents alone (|azimuth| < 0.15): 1.2 / 2.5 / 4.6 tufts fixed, 0.5 / 1.0 /
  1.8 with the exact depth factor. Options for the orchestrator:
  (a) build the plane offsets with B ≈ 1.2–1.5 and drop the bar — rings
  round today's seeded flowers move by ~2 tufts typically (up to ~8), so the
  bees' beds look different from bite 12's at the opening, perspective-true
  (a near ring reads shallower on screen, a far one deeper);
  (b) keep `Ground` offsets but lay them from the parent's **stored** foot
  (`ringFoot` before anchoring, then anchor the result): exact at the
  opening and eye-independent, wild far from the opening (L's original
  concern); (c) (b) near the opening, (a) far, with a seam between.
  `standingFlowers`' plane-distance spacing waits on the same call (it is
  sized against the ring).

- **Steps 2–5 designed, not built** (context ran out). For the next agent:
  - Rules from the anchor: `plantableIn(stand, eye)` and
    `takesFlower(stand, foot, eye)` judge on `anchoredStand(stand,
anchorOf(eye))`; each sprout's foot is moved with `anchored` (left out
    in the sliver, as `hasGround`) and its tuft's `x`/`y`/`size` re-stood
    at the moved foot (`standingOn` + `tuftSizeAt`), identity at
    `OPENING_EYE`. `Grass.tend` passes its `eye`; `Planter` gets the view
    through `Scened` (add `view: () => View | undefined`).
  - The read cut: a cut at `D_SEE` cannot hold beside the 48 cap, which
    counts within `D_SEE` of a new foot up to `D_SEE + PALE_SPAN +
TEND_STEP` from the eye, so the stand read must reach ~`2·D_SEE +
PALE_SPAN + 1` (≈ 29) for the count to be exact. A bee flower is kept
    when its parent is; mushrooms are cut by stored foot, and the cut stand
    must be cached per (`mushrooms`, anchor) or `coversOn`'s per-array
    cache misses every call.
  - The 48: `FLOWER_SLOTS` + a counter over plane feet in `game.ts`;
    anchoring is rigid, so counting anchored feet in `roomIn`/`roomFor`
    equals counting on the plane.
  - Flowers off the opening (every planted one): laid at `{x: 0, z: 0}`
    in the flower's ground size, `viewedOrLaid(…, CLUMP_DISTANCE)` as S2's
    `laidOf`; the drawn size equals today's at the opening (laid size ·
    `opening / ahead` cancels `scaleAt`). Light from the opening place
    where it has ground, else the laid one. `seat`/`onHost` read
    `laid.place` and need the same frame.
  - Tufts tended at one anchor may be refused by `takesFlower` at a
    nearby one (anchor turns 0.04 rad; re-tend waits half a screen).

## L3c (wave 5, `wt/l3c`)

- **Step 1 — rings on the plane (call (a), B = 1.5).** `ringFoot(parent,
ring, anchor)`: the slot's step `(x · size · SPREAD, z · size ·
RING_DEPTH)` on the stored plane, turned with the stand's anchor heading
  (`layout.mushrooms.anchor`), so the same plane spot from any anchor
  (`flower-plots.test.ts` § "a bee's ring" pins it, slot by slot and on
  planted-out stands). `headsApart`/`clearOfFeet` are now plane distance
  over `Footing`s (`mushroomFeet` returns plane feet); the seeded bed's
  screen-true spacing stays, private in `flower-layout.ts`
  (`apartOnGround`/`clearOnGround`). `assertGrounded` checks plane spacing.
  Commit 9a7d9116.
- **Step 2 — half built, in `l3c-step2.patch`** (`git apply` from the
  repo root; does not type-check yet). Done in it: `anchored-stand.ts`
  cuts to `STAND_REACH` (2·D_SEE + PALE_SPAN + 1) by stored foot, a bee
  flower kept while its parent is; the anchored layout (with seeded
  flowers) cached per (layout, anchor) and the cut mushrooms per
  (mushrooms, anchor), so `coversOn`/`perLayout` hit; exports `hasGround`,
  `movedTo` (identity at `OPENING_EYE`), `judgedFrom(stand, eye)`.
  `flower-sight.ts`: `takesFlower(stand, foot, eye)` over new
  `roomFrom(stand, eye)`. **Left in step 2:** `plantableIn(stand, eye)` and
  `tendTufts(stand, grown, eye)` in `tufts.ts` — move each sprout with
  `movedTo`, drop it without `hasGround`, re-stand its tuft at the moved
  foot (`standingOn` x/y, `tuftSizeAt(layout, y)`; keep the tuft itself
  when `movedTo` returned the foot) before `bare`, and judge `room`,
  `headClear`, `bareToTap`, `flowersOf` on the anchored stand; `Grass`
  keeps the eye it tended at and exposes it, so `Planter.tapTuft` judges
  at that anchor; then the callers (`planter.ts`, tests) and a run of
  perches/mushroom-patch/mushroom-room tests, which now see the cut.

## L3d (wave 6, `wt/l3d`)

- **Step 2 — rules from the anchor, built.** The patch's `anchored-stand.ts`
  / `flower-sight.ts` half, plus `plantableIn(stand, eye)` and
  `tendTufts(stand, grown, eye)`: each sprout moved with `movedTo`, dropped
  without `hasGround`, its tuft re-stood at the moved foot (`stoodAt`) unless
  `movedTo` returned the foot itself; `room`/`headClear`/`bareToTap`/
  `flowersOf` judged on the anchored stand. `Grass.tend` passes its eye and
  `Grass.tendedAt()` exposes it; `Planter.tapTuft` judges there.
  `Planter.plantable`/`sowSounding` judge at `OPENING_EYE` until step 5.
  New test: tufts round two eyes far off the opening stand and each is
  taken by `takesFlower` at that eye.

- **Step 3 — the 48 cap, built.** `FLOWER_SLOTS = 48` and
  `flowersCrowdAt(standing, foot)` in `game.ts`, sharing a counter
  (`fullRound`) with `isCrowdedAt`; enforced in `flower-sight.ts`'s
  `plantable`, which both `roomIn` (the child, tufts) and `roomFor` (bee
  rings) go through, so a crowded tuft is not drawn and a bee plants
  nothing there. Counted over the stand's standing flowers, plane feet
  (anchoring is rigid; the anchored stand reads to `STAND_REACH`).

## Left

- The rest of L3: rules from the anchor, the 48 cap, flowers off the
  opening laid in their own frame, `meadow-scene.ts` wiring.
- **Found, not settled — a bee's ring slot moves with the eye.** `ringFoot`
  lays `RING_SLOTS` (offsets in `Ground`) on the parent's ground in whatever
  frame its foot arrives in. In an anchored stand (`anchoredStand` keeps a
  bee's flower as parent + slot and moves the parent) the slot's plane point
  therefore depends on the anchor: across is plane-true (`SPREAD` × slot.x
  at any distance), but depth scales by `y² / 74.6` per z (0.21 at 4 units,
  1.0 at the clump, 2.37 at `D_SEE`). So bees judge a slot at one spot and
  the bed (opening stand) draws it at another, and a ring re-judged from a
  new anchor slides. Opening-frame rings are also unusable far off the
  opening (behind the opening eye `Ground` is wildly stretched). Proposed:
  lay each ring in the parent's own frame — `OPENING_EYE` while the parent
  stands within the opening's flower ground (identity there), else the
  rigid motion bringing it to the nearest point of that region — computed
  from the parent's _stored_ foot, so it is eye-independent. That needs the
  stand's anchor where bee feet are resolved (`plotted`): either
  `anchoredStand` resolves bee feet in the plane before moving them (S3/I's
  file), or plotted reads the anchor off `layout.mushrooms.anchor` once S3's
  fold anchors the stand's ground there.
- **Same root, the bed:** `standingFlowers` judges `headsApart`/
  `clearOfFeet` in the opening's `Ground`, which shrinks distances far ahead
  of the opening eye, so a flower planted at minimum spacing far off may not
  stand in the bed. Judging each flower in its own frame (as the ring
  above) fixes both; the 48 cap counts plane distance, which anchoring keeps.
- **The cap:** `game.ts` has no plane feet for bee flowers (rings are UI
  geometry), so the 48 is best a constant + counting helper there, enforced
  in `roomFor`/`roomIn` where every standing foot is known.
