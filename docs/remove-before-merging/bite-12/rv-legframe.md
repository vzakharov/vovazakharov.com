# rv-legframe — a leg timed in the frame it is drawn in (leg-timing § 8)

Contract: `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` § 8, option 1
of `rv-bee8.md`.

## Done

1. Step 1 — the leg's frame has one home, `model/flight-frame.ts`: `Aloft`,
   `Framed`, `FRAME_MARGIN`, `azimuthOf`, `centreOf`, `framedOf`, `unframed`.
   No behaviour change. `framedOf`/`unframed` take an `EyeFrame` (eye, focal,
   and the point the frame's centre sight meets the horizon, in any unit of
   the screen) instead of a scene `View`, since the model cannot import the
   scene's `middleOf`; the scene builds one with `eyeFrameOf(view, unit = 1)`
   in `insect-frame.ts`, which keeps `aloftFramed`, the veer and the rest.
   Scene tests 100% green (insect-_, perch_, view).

## Left

2. Step 2 — places carry the plane pose and `apartOf` frames the pair by
   `centreOf`'s rule. Planned shape, not built:
   - `Place` gains an optional `pose: { aloft: Aloft; frame: EyeFrame; near:
number }` (`frame` in insect sizes: `eyeFrameOf(view, insectSize)`;
     `near` the `V_NEAR` floor `fromEye` already has, which lives in the
     scene's `view.ts`). `placeOfAloft` fills it, so `sightFrom`'s places,
     `drawn`, `aways`, `awayPlaces` and `wayOutOf` all carry one; the
     opening `perchSight` places and `edgesOf` do not, and fall back.
   - `apartOf`: both ends posed → `centre = centreOf(eye, a.aloft, b.aloft)`,
     both framed by `framedOf(frame, centre, …)`, forward floored at `near`;
     else today's measure. Inside ±`FRAME_MARGIN` of the heading this equals
     today's exactly (centre = heading).
   - `apartIn`'s level for a leg to away: with poses, scale the away spot's
     aloft about the eye (and `EYE_HEIGHT`) by the from's heading-frame
     forward over the away's (`offAloft` is linear in depth along its sight),
     so it stands where `leavingAloft` puts it.
   - `entryOf` drops the brow's pose when it moves `x` halfway (its target is
     on screen, so the pair frame is the heading frame anyway).
   - `placesFlying`: with poses, the share point in the pair frame
     (`unframed`), re-placed by the per-place rule (which moves from
     `plane-place.ts` into `flight-frame.ts` beside it).
   - Unit test with the three classes (bee-8's 1.166 → −1.115 at heading
     1.833; both behind on one side; crossing behind), ratio to
     `veer-away.ts`-style drawn length ≈ 1.
3. Step 3 — tabL and phoneP `--plays veer`.

## Decided / departures

- `scripts/lib/veer-away.ts` and `play-veer.ts` (read-only by the prompt)
  only repoint their imports to `flight-frame.ts` and pass
  `eyeFrameOf(view)`; no probe logic changed.
- `pnpm type-overlap` flagged `eye: Eye` in `EyeFrame` and the scene's
  `View`; the shared member is homed as `Eyed` in `model/ground.ts` beside
  `Eye`, and `View = Camera & Eyed` (`view.ts`): one line in each of two
  files outside the owned list.
