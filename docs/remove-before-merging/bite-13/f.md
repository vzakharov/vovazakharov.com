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

- **Step 4 — `meadow-scene.ts` at 446.** The scene's event wiring (resize,
  press, release, and on shutdown their unbinding, the instrument's and the
  eye's listeners let go and the sound stopped) moves to
  `meadow-listeners.ts`'s `listenOnMeadow`; the release handler is inline.
  Played opening, meadow and rain on tabL: all green but R5's own
  "no rendered frame was timed" (the harness's, also red before this).

- **Step 5 — call 15, the sun dims while it rains.** `rain-sky.ts`:
  `SUN_DIMMED` 0.5, `sunShown(wet)` = 1 − 0.5·wet, tested (half mid-shower,
  whole again by the rainbow's full strength). `RainView.update` sets it as
  the alpha of the sun's and the glow's columns each frame, beside the
  rainbow's. Frame `frames/bite-13/f-tabL-sun-dimmed.png` (R5's play,
  mid-shower). At half alpha the sun reads somewhat see-through (sky blue
  through the rays) more than veiled; a person may want a grey tint
  instead, which would be a palette colour and a second bake.

## Left

Nothing of F's.

## Decided here

- `pnpm type-overlap` reports four overlaps on the branch head
  (`DrawnMushroom.area`, and `Slot`'s `at`, `landed`, `size`), all from
  before this package; left to the review.
