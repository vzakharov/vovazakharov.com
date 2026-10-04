# wp — the walk play checks a ground drag's steps

st.md § "Left", built.

## Done

- `play-walk-checks.ts` `checkWalk`: a drag's frames while the finger is
  down are held to `STRIDE_CRUISE` too (the `down` exemption is gone); from
  the lift on, to `STRIDE_FLING_FASTEST`, only ever slowing.
- `checkUnderFinger` (flight's ground-under-the-finger) is removed, not kept:
  nothing in a steps run calls it, and an unused export fails knip. For a
  flight run once the gait toggle exists, restore it with
  `git show 706ecb0:scripts/lib/play-walk-checks.ts` (and its two call
  sites in `play-walk.ts` at the same commit), gated on the walk's gait,
  which `__probe.eye()` would have to report. `crossingOf` (`walk.ts`) lost
  its only outside importer with it and is unexported.
- `play-walk-swipe.ts` `playHorizonSwipe`: a 0.25 s swipe from a bare point
  at `groundTop + 4` to the screen's foot walks the eye at most
  `STRIDE_CRUISE · 0.25 + STRIDE_FLING_FASTEST · GLIDE_TAU` (3.0 units) in
  fewer than 4 footsteps, never turning it. Played after the drag down the
  screen.
- The strafe's fling check is unchanged and holds in steps: the chase's
  velocity is still the aim's, the ground under the finger.

## Play, tabL

All green. Step drag 1.44 units at most 1.01 units/s; strafe swipe 0.089 by
the lift, 2.600 flung; horizon swipe 2.750 units in 2 footsteps (at most
3.000). `walk-strafe-drag-rest`: the meadow shifted left by the strafe
(the flowers near the foot moved ~280–330 px), heading unchanged, no
mushroom in view.

## Left

- `pnpm type-overlap` fails on st's `line-course.ts` `Line` vs `stride.ts`
  `Chase` (`aim`, `origin`) and `Line` vs `map-view.ts` `Drawn` (`ahead`):
  st's to settle, not this package's.
