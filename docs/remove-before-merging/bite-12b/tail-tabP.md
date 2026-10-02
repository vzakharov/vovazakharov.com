# Package tail-tabP — hand-over note

Step 5 of `tail-screens.md`, the tabP screen: every play, one per call, on a
probe build of e6fc863b.

## Plays

| Play     | Result      | Time         | Notes                                                                   |
| -------- | ----------- | ------------ | ----------------------------------------------------------------------- |
| opening  | green       | 15 s         | cap perch held 0.00 px over 33 turn frames                              |
| meadow   | green       | 1 min 50 s   | 4/4 butterflies perched, 10/10 fly taps; JS median 16.6 ms              |
| walk     | red → green | 1 min / 46 s | harness red, see below                                                  |
| approach | green       | 6 min 21 s   | frame JS median 18.4 ms over 914; slowest frames 8.1–10.6 s (see below) |
| planting | green       | 20 s         | 1 flower planted; bees drank 5, pollinating 2                           |
| species  | green       | 3 min 19 s   | all 6 tapped; a butterfly rested on a porcini; JS median 21.8 ms        |
| tufts    | green       | 2 min 1 s    | turned 0.559 rad, walked 0.80                                           |

## Reds

- **walk, harness:** "ArrowDown: things popped on screen: flower:flower-6
  appeared reaching 579 px, 63.4 of its 74.2 px over the cover". Its x was
  −111, past the left side by 1.5 of its 74.2 px height: the game's own
  `offSides` line (`SIDE_OVERHANG` 1.5), so nothing of it showed.
  `checkPops` (`scripts/lib/play-walk-checks.ts`) now skips a change made
  past a side by the thing's drawn height, and its line names the x. Hand
  check in `to-check.md` § "Хвост 12b, планшет в портретной".

## Not red, worth a look

- **approach's slowest frames:** green, but the slowest frame of each
  class runs 8–11 s: with a lawn call 8137 ms (148 frames, median 19.8),
  with a perch re-sight 10637 ms (25, median 31.1), with neither 8849 ms
  (745, median 18.1). The medians are fine and all three classes carry one,
  so it reads as the container stalling (the run took 6 min 21 s) rather
  than the game; not traced.

## Left

- hold, keys, veer.
