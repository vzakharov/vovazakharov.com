# Package tail-phoneL — hand-over note

Step 5 of `tail-screens.md`, the phoneL screen: every play, one per call, on a
probe build of 0c67619c.

## Plays

| Play    | Result | Time       | Notes                                                                      |
| ------- | ------ | ---------- | -------------------------------------------------------------------------- |
| opening | green  | 12 s       | 15 things at 0.000 px; cap perch held 0.00 px over 91 turn frames; 15.3 ms |
| meadow  | red    | 1 min 54 s | two flight reds, both left for a trace (below); JS median 21.8 ms          |

## Reds

### meadow — two flight reds, left for a trace

Everything else in the play held: 4/4 butterflies perched, 10/10 fly taps,
light at most 0.393 rad off its painted turn, 0 of 4951 butterfly flight frames
facing over 0.3 off, bees drank 6 (3 pollinating). Over 5257 frames:

1. **Turn rate.** `butterfly-1 turned 24.01 rad/s from one frame to the next at
35217 ms, past its kind's 10.81` — a one-frame heading step of roughly
   0.4 rad (`flier-watch.ts` divides the step by the frame gap, so a long frame
   would lower the rate, not raise it). Not traced: which leg or perch the
   butterfly was on at 35217 ms is not in the line.
2. **Heading.** `bee-12 faced 1.52 rad off the way it flew at 80350 ms` —
   mid-leg, 784 ms into a 1292 ms leg (departs 79567, arrives 80859) to
   `flower-1`, one leg, `turn` -1.543. `steering.heldAt` is 80350, the same ms
   as the red, `steering.facing` 1.025, `steering.turn` 2.548,
   `setOff.meant` 3.136, `setOff.wound` -2.158. 6 of 466 bee flight frames
   faced over 0.3 off. The leg JSON in full:
   `{"from":{"x":-8.1728,"y":2.2270,"h":3.3488},"to":{"kind":"flower","id":"flower-1"},"departs":79566.67,"arrives":80858.90,"dash":{"time":0.2,"way":0.75},"leaves":82896.18,"legs":1,"turn":-1.5432,"travel":131.74,"steering":{"facing":1.0245,"turn":2.5482,"heldAt":80350,"setOff":{"bow":1,"turns":{"lifted":0},"meant":3.1358,"wound":-2.1581},"perch":{"x":85.69,"y":270.82,"forward":11.37}},"end":{"x":85.69,"y":270.82,"forward":11.37}}`

Neither showed on phoneP.

## Left

- walk, approach, planting, species, tufts, hold, keys, veer.
