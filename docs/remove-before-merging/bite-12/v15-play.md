# v15-play — meadow and veer at f584982, tabL and phoneP

Plan item 2, under the play-run rule. No `src/` or script change committed:
every red was traced, none to a game fault that could be proven and fixed
inside this run's budget. Frames in `frames/bite-12/v15/`.

## Runs

1. `--screens tabL --plays meadow,veer` (with the build): 3m55s. Frame
   median 22.9 ms over 757 frames.
2. `--no-build --screens phoneP --plays meadow,veer`: 3m13s. 21.9 ms over
   804 frames.
3. (`walk,planting,hold` on tabL) not run: context spent on tracing.

## Reds and what each is

- **The flier watch's worst heading** (tabL fly-7 2.79 rad; phoneP fly-7
  2.53 rad) — **harness.** Traced with an uncommitted probe: the fly is
  shying (`shied === legs`), the watch's travel window spans its dart's
  rise, and the dart moves the point without turning by design
  (`insect-dart.ts`). The body faces its flight to the perch exactly
  (`turn = facing + π/2`). Left in place: it does not block the run.
- **Under the shying fly, tabL butterflies 87 of 2757 frames over 0.3 rad,
  worst 0.79** — all 87 from one leg: butterfly-1 cap→away left, a 13.4 s
  leg drifting slowly (~70 px/s) off the left edge at zoom 0.65. The off
  swings with the flutter (0.3 → 0.79 → 0.3 over ~430 ms) about a mean of
  ~0.4: the body points ~20° up while the drift runs level. Part
  measurement (one bob does not cancel at this slow drift), part possibly
  the frame-to-screen bend v14-reds named. For the operator's eye.
- **No butterfly ever rested on a cap** (tabL) — **harness/design**, as
  v14-reds § 3 measured: the clump's two caps are held by flies.
- **Least drawn spans** (butterfly 38/37 px under 52, fly 27 under 30) —
  **harness**: `LEAST_SPANS` is the at-clump size; the watch bounds drawn
  size, which the decided sizing by distance shrinks at the back (0.65–0.73×).
- **Fly one-frame steps over the dash bound** (tabL 126, most 83.7 px own
  size, all fly-22 cap→away; phoneP 28, fly-25 air→cap walked into) —
  **game, not fixed.** fly-22's leg (veer play, ~138.1 s, heading 0,
  eye at the opening spot) is timed 1.33 s (6.65 sizes at 5/s) but drawn
  from x 476 to past the right edge at zoom 0.73, ~14.6 sizes: flown at
  ~2.2× its cruise, 643 px in 0.3 s. `veer-away.ts` (opening meadow) shows
  every leaving leg at 0.95–1.12, so the mis-timed leg is from a cap the
  veer play grew (d 12.0). Suspect: `Perches.sightFrom` corrects only
  `fromEye` for a perch's place, keeping the `x, y` laid by `perchSight`,
  against an away place made from the current view. Next: dump
  `sightFrom(viewNow()).places` at that leg's set-off (the probe was
  half-written when the budget ran out), then fix and unit-test.
- **Bee steps over the bound** (tabL 10, phoneP 10; most 27.4 / 31.1 vs
  25.8) — known class, small; not traced.

## Seen by eye

- Shadows sit under fliers (startled butterfly, the fly in the veer-back
  frame — far below a high fly near the eye, consistent with its size).
- No insect under the grass in the frames looked at; no hairline seen on
  the sky at reading scale (no pixel scan: no PIL in the container).

## Left

- Trace and fix fly-22's away timing (above).
- Run 3 (`walk,planting,hold`).
