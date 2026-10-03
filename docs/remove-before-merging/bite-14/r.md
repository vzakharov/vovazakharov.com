# R — the `sprouts` rerun after `risen`, and meadow's fly-8 turn

`bite-14.md` § "Left, in order" items 2 and 3.

## Done

- `pnpm play:mushrooms --plays sprouts,meadow --screens tabL` on 534cb4c
  (after ST's `risen`, 7144209b): **`sprouts` passes** with no fix — three
  spores of `mushroom-2` sown 0.96, 0.99, 0.70 apart, one picked up, rain:
  2 sprouts, 0 spores left, its frame 12.8 ms; frame budget 14.3 ms median
  over 295 frames (26 ms budget). Same numbers as SD's run before `risen`.
- Frames looked at: the dots sit on the grass round the clump's foot; after
  the rain two small fly agarics stand clear of both caps (left-front and
  right of the front stem). Committed `frames/bite-14/r-1-sown.png`,
  `r-3-up.png`.
- `meadow` red again, the same number: `fly-8 (fly) turned 36.18 rad/s …
at 87983 ms, past its kind's 36.04`. Traced (below); not fixed.

## fly-8, measured

A scratch dump of the watch's worst frame (instrumentation reverted):

| at 87983 ms, dt 16.67 ms   | before | after  | step   | rate (rad/s) |
| -------------------------- | ------ | ------ | ------ | ------------ |
| model turn (`steer`)       | 1.2094 | 0.6094 | 0.6000 | 36.00        |
| drawn rotation (container) | 1.1847 | 0.5818 | 0.6029 | 36.18        |

- The leg: fly-8's first, in from `away` to a cap, departs 86917,
  arrives 87998 — the frame is 15 ms before it lands, `aloft` still 1.
- The model is exactly at its clamp: `steer` limits the body to
  `TURN_RATE.fly` (36) per model ms, and the fly's turn into its landing
  asks more than 0.6 rad in that frame (a fly "snaps round", as
  `TURN_RATE`'s doc says).
- The drawn rotation is `turn + airborne · (bentTurn − turn)`
  (`insect-drawn.ts`): the screen's bend of the pinhole's rows maps the
  frame's turn to the screen's with a local slope a hair over 1 (here
  1.005: the bend's offset went −0.0248 → −0.0277 rad). So any turn that
  rides the model's clamp is drawn up to ~0.5 % faster at that place on the
  screen — the same effect call 27 recorded for the butterfly (10.90 vs
  10.81, accepted).
- So it is neither a flight-model fault (the model holds its limit
  exactly) nor a watch error (the watch measures what is drawn): it is the
  screen's bend on a turn at the limit.

## Options, not taken (no clean fix within the bound)

1. Accept in writing, as call 27 did: 0.5 % over for one frame, at a
   landing, nothing a child sees.
2. Clamp the drawn rotation itself in the view (`insect-view.ts`): a
   second, per-flier limiter on `posed.rotation` against the last drawn one,
   which then carries state the model's `wound` count does not see and
   shifts the light/nectar pose that read `rotation`. Not built: a new
   moving part for 0.5 %.
3. Give the model's clamp headroom for the bend (e.g. 0.99 × `TURN_RATE`):
   a magic margin with no bound proved — the bend's slope depends on where
   on the screen it flies.

The watch's threshold was not touched.

## Left

- The orchestrator's call on fly-8 (option 1, 2 or 3).
