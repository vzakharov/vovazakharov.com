# rv-legframe2 — a leg timed in the frame it is drawn in, step 2

Contract: `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` § 8;
continues `rv-legframe.md` (step 1), whose planned shape this builds.

## Done

- Step 2 — places carry their plane pose; `apartOf` frames a leg's pair by
  `centreOf`'s rule (all in `model/flight-frame.ts`):
  - `Place.pose?: Pose` (`{ aloft, frame, near }`, `frame` in insect sizes).
    `placeOf(frame, near, aloft)` is the per-place rule, moved from
    `plane-place.ts`; `placeOfAloft` is now `placeOf(eyeFrameOf(view, unit),
V_NEAR, aloft)`, so every place the scene builds through it is posed
    (`sightFrom`'s places, `drawn`, `aways`, `awayPlaces`, `wayOutOf`). The
    opening `perchSight` places, `edgesOf` and `entryOf`'s moved brow are
    unposed and time as before.
  - `pairFramed(here, there)`: both posed → both framed in `here`'s frame at
    `centreOf`, forward floored at `near`; `apartOf` measures those.
  - `levelWith(here, away)` for a leg to away: the away spot's aloft scaled
    about the eye (and `EYE_HEIGHT`) by `here`'s heading-frame forward over
    its own, both floored at `near` — where `leavingAloft` puts it. Unposed,
    today's `fromEye` swap.
  - `placesFlying`: posed, the share point mixed in the pair frame, then
    `unframed` and re-placed by `placeOf` (`PairFrame.placed`).
  - Within ±`FRAME_MARGIN` every result equals today's (to 1e-9; tested).
  - `model/flight-frame.test.ts`: bee-8's leg (drawn/timed 0.984; per place
    1.66), both behind on one side (0.999; per place 3.4), crossing behind
    (0.975; per place 0.38).

## Left

- Step 3 — tabL and phoneP `--plays veer` (another agent).

## Decided / departures

- The pair is framed in the leg's start's frame (`here.pose.frame`); a
  sight's places share one view, so the two frames are the same.
- `placesFlying` mixes the floored forwards (today's rule), so a cut point
  whose end stood nearer than `V_NEAR` is unframed at the floored depth; it
  matches today's place exactly inside the margin.
