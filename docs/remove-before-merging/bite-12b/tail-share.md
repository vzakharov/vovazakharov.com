# tail-share — hand-over note

**Step (T141's expect)**: the approach play now fails when any frame's
lawn-tending share (`__probe.tendFrames()`' `tend`) exceeds `FRAME_BUDGET_MS`
(26 ms, now exported from `scripts/lib/frame-budget.ts` — the one line
outside the package's files), and when bees planted but no tend frame was
recorded.

**tabL run** (one, under the site lock): 20 bee plantings, 583 tend frames;
tending's share median 1.2 ms, slowest 20.4 ms — green. The frames carrying
a tend: median 3.2 ms, slowest 57.2. The run as a whole was red on the
pre-existing whole-frame median expect: 26.2 ms over 918 frames against 26
(slowest frame 6659.5 ms, so the machine was likely loaded). Not this
package's expect; left for the frame-cost agent.

**Left**: nothing in this package. `to-check.md` untouched (the new
measure was not unreliable).
