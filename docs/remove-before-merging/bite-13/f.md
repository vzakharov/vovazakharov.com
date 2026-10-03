# F — small fixes: hand-over note

## Done

- **Step 1 — the gush gets its own room.** `rain-fall.ts`: `MOST_DROPS`,
  `GUSH_DROPS`, `STEADY_DROPS` moved here with two pure counts —
  `steadyToStart(downpour, { all, gushed })` (the steady share of 96, a
  gush's drops not counted against it, within 120) and `gushToStart(all)`
  (24, within 120); tested in `rain-fall.test.ts`. `rain-drops.ts` marks a
  slot `gushed`, so a restart tap adds its 24 on top of the steady rain
  instead of pausing it.

- **Step 2 — the shower's sound reads the scene's wetness.** `RainView.update`
  steps its showers before the backdrop check and passes `wetnessShown` to
  `sound.shower`, so a restart while the last shower dries keeps the hiss.

## Left

3. Rainbow below the clouds (depth), frames on tabL and phoneP.
4. `meadow-scene.ts` under 450 lines by a real seam.

## Decided here

- `pnpm type-overlap` reports four overlaps on the branch head
  (`DrawnMushroom.area`, and `Slot`'s `at`, `landed`, `size`), all from
  before this package; left to the review.
