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

## Left

- **L2 — the lawn by plane cells** (spec § 7): not started. It starts in
  `tufts.ts`: `growTufts`/`grownTuft`/`mostTufts` (`TUFTS_PER_1000PX`,
  `GROWN_DOWN`, `BACK_BUNCH`) give way to 4 × 4-unit plane cells of 14 tufts
  from `mulberry32(hash(visitSeed, i, j))`, live within
  `D_SEE` + `PALE_SPAN` + a cell's diagonal of the eye; `Grass.paint`'s
  regrow-on-layout-change becomes regrow-on-eye-cell-change, and
  `tufts.test.ts`'s stream-identity cases (`grassOf`/`tuftingOf`,
  `shownSprouts`' `growTufts` calls) are rewritten against cells.
- **L3** — a later agent's.
