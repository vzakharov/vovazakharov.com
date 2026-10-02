# Package tail-tabP — hand-over note

Step 5 of `tail-screens.md`, the tabP screen: every play, one per call, on a
probe build of e6fc863b.

## Plays

| Play    | Result      | Time         | Notes                                                      |
| ------- | ----------- | ------------ | ---------------------------------------------------------- |
| opening | green       | 15 s         | cap perch held 0.00 px over 33 turn frames                 |
| meadow  | green       | 1 min 50 s   | 4/4 butterflies perched, 10/10 fly taps; JS median 16.6 ms |
| walk    | red → green | 1 min / 46 s | harness red, see below                                     |

## Reds

- **walk, harness:** "ArrowDown: things popped on screen: flower:flower-6
  appeared reaching 579 px, 63.4 of its 74.2 px over the cover". Its x was
  −111, past the left side by 1.5 of its 74.2 px height: the game's own
  `offSides` line (`SIDE_OVERHANG` 1.5), so nothing of it showed.
  `checkPops` (`scripts/lib/play-walk-checks.ts`) now skips a change made
  past a side by the thing's drawn height, and its line names the x. Hand
  check in `to-check.md` § "Хвост 12b, планшет в портретной".

## Left

- approach, planting, species, tufts, hold, keys, veer.
