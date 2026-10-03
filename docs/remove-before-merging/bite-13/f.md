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

- **Step 3 — the rainbow behind the clouds.** `backdrop-depths.ts`:
  `rainbow` −6.5, between the sun (−7) and the clouds (−6); the far hills
  (−5) still stand in front of it, as before. Frames
  `frames/bite-13/f-{tabL,phoneP}-rainbow-behind.png`, from a throwaway
  copy of the play runner under the worktree's `tmp/look/` (tap a cloud,
  hold → half a turn, step to the full rainbow, shoot); on tabL a cloud
  crosses the arch and covers it, on phoneP none does.

## Left

4. `meadow-scene.ts` under 450 lines by a real seam.

## Decided here

- `pnpm type-overlap` reports four overlaps on the branch head
  (`DrawnMushroom.area`, and `Slot`'s `at`, `landed`, `size`), all from
  before this package; left to the review.
