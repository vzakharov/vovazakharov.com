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

## Left

- **L3** — a later agent's: judge `plantableIn` from the current anchor
  (`model/anchor.ts`), which is what makes far grass stand.
