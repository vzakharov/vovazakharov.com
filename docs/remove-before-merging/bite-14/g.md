# G — call 37's ground swipe, option 2: a fling (branch `wt/g37`)

Not landed on the session branch: the operator has not chosen option 2 yet;
the orchestrator lands `wt/g37` at the bite's tail if he does.

## Done

- Step 1, the model (`model/glide.ts` new, `model/pan.ts`, `model/stride.ts`,
  `model/walk.ts`, `model/stride.test.ts`):
  - A chase samples its target's velocity as the finger moves
    (`chaseTo(stride, aim, time)`, blended as the pan blends a finger's).
    On the lift (`liftChase(stride, time)`), a finger still moving flings
    the eye on along the chase's line from the faster of the eye's own pace
    and the finger's speed that way, capped at `STRIDE_FLING_FASTEST`
    (5 × cruise, 8 units/s, so at most 2.6 units of glide); the glide
    decays on the pan's curve, 95 % of it within 1 s, at rest by
    `GLIDE_OVER` (1.95 s). A finger at rest for `STILL_AFTER` before the
    lift, a speed under `STRIDE_FLING_SLOWEST` (cruise / 8), or any walking
    key held at the lift: C37's ease to rest, unchanged.
  - Any walking, strafing or turning key going down (`yieldChase`) ends the
    fling where the eye stands and hands its pace, held to the cruise, to
    the keys; a new press (`chaseFrom`) ends it with pace 0.
  - A step's chase now starts afresh at the slop's crossing, as a strafe's
    did, so the crossing's jump counts toward no fling (the pan's rule).

## Shared with the pan's fling

`model/glide.ts` is the one copy, `pan.ts` and `stride.ts` both import it:
the curve (`GLIDE_TAU`, `GLIDE_OVER`, `glided(u)`, and `glidePace(u)` — the
pan's `paceAt` slope), the finger's velocity sampling (`blended`,
`VELOCITY_WINDOW`) and the still-finger rule (`flung`, `STILL_AFTER`), with
the types `Sampled` and `Flinging`. Each axis keeps its own cap and floor
(px/s for the crop, units/s for the ground) and its own state: the pan
stores a closed-form glide from `began`, the stride integrates `spent`
seconds frame by frame, since it is ticked.

## Left

- Step 2: `scripts/lib/play-walk.ts` ~405–422's strafing-drag check, and the
  `walk` play on tabL.
