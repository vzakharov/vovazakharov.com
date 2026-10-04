# nt — four review nits

From `review-read1.md` 5, 6 and "Not finished", and `review-read2.md` 6.

## Done

- **a, sound direction** (`dusk-view.ts` `tap`): the tap flips `toward`
  itself before choosing `sink` or `grow`, so two taps in one frame play
  `sink` then `grow`. `update` still resets it from the meadow each frame.
- **b, morning keeps the picker** (`game.ts` `dusk`): the flower picker shuts
  only on a turn toward dusk. Tested in `game.test.ts` (both directions).
- **c, the bees test was vacuous.** With `room: dusky ? [] : room` replaced
  by `room`, "keeps the bees from planting" stayed green. The reason: at full
  dusk every bee sits out on its flower (`roost.ts` `sitsOut`) and never takes
  off, and a bee plants only on take-off. The `room` rule guards the one
  take-off left at dusk, a tap (`startle`). `plantedBy` now taps every flier
  every 2 s. Under the mutant the dusk run plants 4 and the test fails
  (`actual: 4, expected: 0`); restored, it passes. (A tap every 1 s keeps the
  bees from pollinating at all, so the day half fails.)

- **d, gait-spot fallback** (`gait-spot.ts`). Measured over every named
  screen either way round, FLOOR_HELD, TURNED_SMALL and a 240–2600 px grid
  in 40 px steps: no named screen gets past the first tier. 45 grid screens,
  all about 520 px or less on a side, do. On 4 of them (320×280, 320×360,
  360×240, 360×280) the old last tier put the button on the meadow though
  the sky had a spot clear of the rays. A new tier between the two, sky
  with no ray inset, keeps it there. `gait-spot.test.ts` pins those 4, and
  fails on the old code. The grid scan now skips rows whose distance from
  the map button is no less than the nearest spot found so far. The result
  is the same and the scan stops early. Layouts took 0–23 ms on every named
  screen before the change.

Nothing left.
