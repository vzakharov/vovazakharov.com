# mc — why the mice did not run at dusk

**Cause.** A mouse ran only to a door within `RUN_REACH` (2.5 clump sizes on
the plane) of its own, but `+` grows each mushroom as far from the others as
the screen allows (`pickFoot`, Mitchell's best candidate). On a child's
meadow — houses grown with `+`, a door put on each — the doors stood 2.6–15
apart (phoneP: 2.6, 2.95, 4.8; tabL: 4.9, 10.5, 14.7), so every dusk outing
found no door in reach and fell back to the silent peek. Our own play only
furnished the opening clump, whose feet are 0.25 apart.

Every other condition checked out on that meadow: dusk past half, the
timer (set once, not reset per frame), the reducer tick, the houses `seen`,
the mice counted in, the scene playing `NightRuns.last`.

**Fix (landed).**
- `mouse-run.ts`: `RUN_REACH` is gone; a mouse runs to any door drawn now
  (`seenBesides`), the emptiest then the nearest. This is shared with taps,
  calls, a sinking house's mice and re-targets, so a tap now runs between
  any two houses on screen too.
- `mouse-run-clock.ts`: `RUN_MOST = 6` s caps a run's running leg; a longer
  course is run faster (a 15-unit run is ~2.5 u/s instead of 0.6).
- Tests: the reach tests became sight tests; a night-runs test on the tabL
  layout measured above; a clock test for the cap.

**Checked.** A scratch play (three mushrooms grown with `+`, a door each,
sun tapped; not committed) on tabL and phoneP: before, every outing peeked
over 30 s; after, runs between the houses from the first seconds.

**Left.** `play-night-run.ts` still plays the opening pair only; a play
that grows its own houses with `+` would have caught this. `mouse-runs.ts`
(462 lines) untouched; its comment at line 237 still says "in reach".
