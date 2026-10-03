# Bite 14 — P3a hand-over: the probe's `sprouts()` and the `sprouts` play

## Done

- `scripts/lib/mushroom-probe.ts`: `__probe.sprouts()` and its schema
  `Sprouts` → `{ shed, oldInSight, sprouts: [{ id, parent, ofParent, at,
shown, scale, apart }] }`. `scale` is the drawn height of full size with
  the zoom taken out (breath left in); `apart` is the foot's screen distance
  from the parent's in `camera.unit × parent zoom`. "Old" is read as
  `isOld` does, the window injected from `SPORE_FALL_MS + SPROUT_MS`.
- `scripts/lib/play-sprouts.ts`, registered as `sprouts`: taps the first
  cloud, steps to the stop, seeks the shed frame (≤ 30 frames), notes its
  cost; fails on no sprout with an old mushroom in sight, > `SPROUTS`,
  a sprout of another species or more than 1.5 × `SPROUT_REACH` off its
  parent, a sprout shown 30 frames after the shed (spores falling), one not
  shown at +60 (popped), or one not larger 20 s on. Shoots
  `sprouts-1-fall` (+30), `sprouts-2-pop` (+60), `sprouts-3-grown` (+20 s);
  24 single frames after the pop feed the run's frame budget.
- Frames: `docs/remove-before-merging/frames/bite-14/p3a-tabL-{fall,pop,grown}.png`,
  `p3a-phoneP-pop.png`.

## Run (all five screens, seed 12345)

Every screen the same: mushroom-1 sheds 3 sprouts (2 old in sight), apart
0.96 / 0.97 / 0.84, scale 0.40–0.41 at the pop → 0.58–0.59 20 s on; no page
error; all sprout checks pass. Shed frame 78–176 ms (one rendered frame,
machine load ~8.8 on 4 cores). The run's frame-budget gate failed on tabP
(30 ms) and phoneP (38 ms) in the second run, tabL/phoneL/phoneS 17–21 ms;
the first run failed others — load from the parallel agents, not the play.

## Left

- Nothing in P3a. Not done: the sweep's `--showers` (P3b).
