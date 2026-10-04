# st — a ground drag walks in steps again

The operator: «в какой-то момент движение от перетаскивания перестало
привязываться к шагам, сейчас можно перелететь буквально на 50 метров за один
свайп… но как базу "шаги" хочется оставить.»

## Cause

ccfff90d (bite 14, call 44, "the ground stays under a moving finger") took
the cruise cap off a ground drag: the eye stands wherever the finger's aim
puts it, at once. The aim is the ground under the crossing brought to the
finger (`walk.ts` `stepAim`, the strafe's `reference · (tan from − tan to)`),
and near the horizon that ground is far off — up to `D_SEE` ≈ 13 units ahead,
and across up to `reference · 2 · tan 1.3` ≈ 7× that. So one quarter-second
swipe by the horizon on tabL flies 7.3 units along the heading and 18.7 across
(9–26 across the other screens), ~9 and ~23 steps, then call 43's fling adds
up to 2.6. Before it, bite 12's rule held: a step chases the finger's row
never faster than `STRIDE_CRUISE`.

## Done

- `stride.ts`: a chase carries a `Gait`, `'steps' | 'flight'`. In `steps`
  `chaseTo` only samples the aim and `tick` walks the eye to it at the cruise
  over `KEY_EASE`, braking to rest on it (`line-course.ts`, the course bite
  12's chase used before ccfff90d), every unit walked a step. In `flight` it
  is ccfff90d + 52a334e unchanged (eye on the aim at once, feet owed and
  stepped at the cruise). The lift: a quick finger flings in both (call 43,
  ≤ 2.6 units); a finger at rest leaves a flight standing and eases a walk
  to rest from its pace as a let-go key does (call 37's ease); held keys
  take over from the eye's pace in steps, the finger's in flight.
- `walk.ts`: `Walk.gait`, `'steps'` in `openingWalk`, handed to every
  `chaseFrom`.
- Tests: the flight-specific walk tests run on a flying walk; new ones — a
  walking chase never passes the cruise and rests on the aim with its feet
  having stepped it all; a 15-unit swipe walks ≤ 0.48 under the finger and
  < 4 steps in all where a flight goes 15; a finger at rest eases a walk to
  rest; on every screen a quarter-second horizon swipe (step and strafe)
  walks ≤ cruise·0.25 + 2.6 units where a flight goes more than twice that.

## How flight would be wired (the operator's next ask, not built)

- The toggle sets `walk.gait` in `EyeInput` (`ui/scene/eye-input.ts`, which
  owns `this.walk`): `this.walk = { ...this.walk, gait }`. A press reads it
  at `pressAt`/`locking`, so a switch mid-drag waits for the next press.
- The button, right of the map button, draws a footprint for `steps` and a
  flight symbol for `flight`; its state is the walk's `gait`, so a resize's
  `refit` keeps it. Whether it outlives a reload is a saving call.
- A raised camera in flight is the lens's (`ground.ts` `EYE_HEIGHT`): it
  would be a per-gait eye height the view and `distanceOfRow` read, which
  touches every projection — its own design step.

## Left (stopped at the context line, play not run)

- `scripts/lib/play-walk.ts` still asserts flight: `checkUnderFinger`
  (`play-walk-checks.ts`) wants the ground within 3 % of the finger on every
  move of the step drag (`playWalk`, "a drag down the screen") and the
  strafe swipe (`playStrafes`), and the strafe's fling check reckons the
  finger's speed from the ground under it. In steps both go red. Next step:
  in `checkUnderFinger`'s place, check the eye's pace while the finger is
  down never passes `STRIDE_CRUISE` (`checkWalk` already has the paces;
  drop its `down` exemption for `'drag'`), and add a long swipe from
  `groundTop + 4` to the foot of the screen in 0.25 s asserting the eye went
  at most `STRIDE_CRUISE · 0.25 + STRIDE_FLING_FASTEST · GLIDE_TAU` (≈ 3.0
  units, < 4 steps). Keep `checkUnderFinger` for a flight run once the
  toggle exists. Then run `flock /home/user/vovazakharov.com/tmp/site.lock
  pnpm play:mushrooms --screens tabL --plays walk` and look at
  `walk-strafe-drag-rest`.
- `pnpm knip` and `pnpm type-overlap` not run (`wayOf` is exported again
  from `cruise.ts` for `line-course.ts`; `Gait` is imported by `walk.ts`).
