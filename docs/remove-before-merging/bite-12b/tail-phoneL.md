# Package tail-phoneL — hand-over note

Step 5 of `tail-screens.md`, the phoneL screen: every play, one per call, on a
probe build of 0c67619c.

## Plays

| Play     | Result      | Time                                       | Notes                                                                                        |
| -------- | ----------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| opening  | green       | 12 s                                       | 15 things at 0.000 px; cap perch held 0.00 px over 91 turn frames; 15.3 ms                   |
| meadow   | red         | 1 min 54 s                                 | two flight reds, both left for a trace (below); JS median 21.8 ms                            |
| walk     | green       | 40 s                                       | ↓ held 12 s walked back 19.000 (reckoned 19.000); 12 under the cover, at most 8.3 px over it |
| approach | red         | 6 min 7 s                                  | frame budget: JS median 47.1 ms over 918, past 26 ms; left for a trace (below)               |
| planting | green       | 13 s                                       | 1 flower planted; bees drank 7, pollinating 4                                                |
| species  | green       | 2 min 30 s                                 | all 6 tapped; a butterfly rested on a porcini; JS median 25.1 ms                             |
| tufts    | green       | 12 s                                       | turned 0.559 rad, walked 0.80                                                                |
| hold     | green       | 1 min 2 s                                  | 1 tuft came back where flower-7 stood                                                        |
| keys     | green       | 27 s                                       | 4-note melody grew 4; `l`/`h` plant and replace                                              |
| veer     | red → green | 2 min 44 s; re-runs 2 min 19 s, 2 min 45 s | bee kept off the one flower in view by butterflies; harness red, check loosened (below)      |

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

### approach — over the frame budget, left for a trace

`walking into the forest and turning there: a rendered frame's JS takes
47.1 ms at the median of 918, over the 26 ms budget`, and 44.8 ms over all 974. phoneP's median was 16.5 ms on the same play. The game's own measured work
is small: lawn tending calls 180, median 1.7 ms (slowest 18.6); perch
re-sights 25, median 7.1 ms (slowest 31.0). The frames carrying neither are as
slow as the rest — 710, median 45.8 ms, slowest 4911.6 — so the cost sits
outside both, in the frame's draw or in the container. The run took 6 min 7 s
(phoneP 3 min 57 s); the load average stood at 4.45 on 4 cores right after it,
with nothing but the play's own browser running. Not traced: whether the
landscape phone draws enough more of the field to cost this, or the container
was starved, needs a re-run on a quiet machine and a profile of a "neither"
frame.

### veer — the bee kept off the flower, a harness red

`looking back, none of 6 bee releases took a perch in view`. Looking back the
play grows one mushroom and one flower (`planted-3`); every one of the six
bees took the air, and every try's line shows `planted-3` held — by
`butterfly-16`, the butterfly the play released just before, in the first run;
by `butterfly-4` and `butterfly-2`, roaming in from the meadow, in a re-run
with the bee released before the butterfly. The bee's in-view choice had
nothing open, which is the game's rule, so the reorder was dropped and the
check loosened instead (`scripts/lib/play-veer.ts`): a bee whose every try
took the air while another insect held a flower is noted
(`…: the flower held on every try`), not failed; the fly and butterfly stay
held to it as before. A line for a person is in `to-check.md`
(tail-phoneL). The third run went green. The runs repeat: the third named the
same insects as the first (`butterfly-16`, `fly-14`), so the meadow's reds
should reproduce for a trace.

## Left

- The meadow and approach reds, for a trace.
