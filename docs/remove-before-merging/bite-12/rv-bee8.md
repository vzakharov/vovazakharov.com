# rv-bee8 — bee-8's 15 overs on tabL `veer`

## Verdict: the game, not the snap

The bee flies its leg about 1.7× faster than the leg is timed for, whether or
not it is on screen. The play's `face(0)` only turned the eye toward the
fastest part of the flight, which at heading 1.83 was off the left edge.

Traced from a dump of `seen` (bee fields plus the view's `centre`, `from`,
`goal`, framed point and drawn aloft) over one tabL `--plays veer` run at
af83d2f9. The red reproduces exactly: 15 over, 38.4 px against 31.5. The dump
code was not committed.

- **The snap changes nothing on the plane or in the leg's frame.** Frame by
  frame, the framed step runs 41.2 → 44.1 → 42.8 px through the snap frame,
  and the plane step stays 0.44 → 0.47 → 0.44 units. Only the screen step
  jumps (1006 px). `eyeMoved` already drops that frame, and the 14 frames
  after it are the bee's own motion.
- **Before the snap the same stretch was flown hidden**: frames 6941–6950
  culled at x −28. The bee went off the left edge at azimuth ≈ 1.0 and was
  shown again at 0.51, right where the snap put it.
- **The drawn chord is 1.71× the timed one.** The leg runs from azimuth 1.166
  to −1.115 (plane chord 21.3 units), with the eye heading 1.833.
  - The model times it from `placeOfAloft`, one perch at a time. The start
    (0.67 off the heading) is framed at the heading. The end (2.95 off, past
    `FRAME_MARGIN` 1.77) is framed at its own turned centre, at the margin.
    `apartOf` gives 1367 (frame px × log-mean forward ÷ `CLUMP_DISTANCE`).
  - The view steers both ends in one frame, `centreOf` = 0.657, which the
    clamp turned 1.18 off the heading. The same measure gives 2340.
  - The ratio is 1.71. Divide the 38.4 px peak by it and you get 22.5, which
    is under the 31.5 bound, so a leg timed in the view's frame would pass.
- **This is a whole class of legs, not one leg.** Of the 49 bee seat-to-seat
  legs in the run, 31 were framed off the heading (an end more than 101° off
  it). Drawn/timed ratios on those legs:
  - median 1.79, range 0.30–29.5;
  - ×28–29 for two flowers both behind the eye on one side, because the
    model clamps both onto the same edge line;
  - ×0.3–0.5 for legs that cross behind the eye, where the model's frames
    sit on opposite edges.

  Only 6 of the 31 were ever drawn while flying, because the eye stays put
  in the play.

## Why there is no minimal fix

Plan decision `leg-timing.md` § 1 times each perch in the eye's frame,
clamped one perch at a time. Inside ±`FRAME_MARGIN` of the heading this
matches `centreOf` exactly, because the clamp does not bite. Past the margin,
the view's frame depends on both ends of the leg. No number per perch can
reproduce it, and § 1 already lists "two frames still meet in `apartOf`" as
the reason per-perch corrections were rejected. A real fix reopens § 1, so it
is reported here and not built (per the brief).

Options, measured against this run:

1. **Time a leg in the frame it is drawn in.** Each `Place` would carry its
   plane pose (azimuth off the heading, distance, height) and the screen's
   focal length per unit. `apartOf` would then frame the pair by
   `centreOf`'s rule. To avoid a second copy of that rule, `centreOf` and
   `framedOf` would move to the model.
   - Touches `flight.ts` (`Place`), `flight-timing.ts` (`apartOf`,
     `placesFlying`), `plane-place.ts`, `insect-away.ts` (`awayPlaces`) and
     `flight-in.ts`, plus `fliers.test.ts`.
   - Fixes every ratio above (each ratio goes to 1).
2. **Extend the clamp linearly past the margin**, one perch at a time, with a
   C¹ continuation of the tangent. This is still wrong for pairs both behind
   the eye (the frame's slope near the centre is 0.39× its slope at the
   edge), so not exact.
3. **Accept.** These legs are drawn 0.3–29× their cruise, and only while an
   end is more than 101° off the heading when the leg sets off. A child sees
   one only by turning toward it mid-flight.

## What a child would notice

The child faces away from the clump (or looks back at it), then turns while
bees hop between flowers. A bee that set off while the child faced away can
dash across the screen in a fraction of a second (bee-8: about 1.7× its
cruise across the lower screen). A bee hopping between two flowers both
behind the child can streak (up to ×29), or crawl when it hops across behind
(×0.3). Flies and butterflies go by the same timing, so they behave the
same.

## Done

- Trace and measurement (this note).

## Left

- The orchestrator's call between options 1–3. Nothing changed in source.
- The same run's one fly over is fly-3 cap→cap, 43.9 px. It is the accepted
  2% (`leg-timing.md` § 7) and unchanged.
