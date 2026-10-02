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
