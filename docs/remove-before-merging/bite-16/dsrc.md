# Package D-src — `/dry` over bite 16's tail under `src/`

Scope: `git diff aca95c51..origin/claude/mushroom-game-syama-lbirv7 -- src`
(packages F, E, G and the pinhole / meadow-taps moves).

## Done

- `model/worm.ts`: the tap on the worm's clock (`-WINDOW_SWING`, three
  callsites) named `TAP = wormClock(0)`; `tripSpan` and `PEEK_SPAN` share
  `shutAfter(duration)` (swing open, out, swing shut).
- `ui/scene/flower-sight.ts` + `tending.ts`: `widestSpanOn(layout)` is the
  span `flowerInSight` judges by unless told, and `sightSlack` builds on it,
  so the tufts' re-tend slack follows the sighting's span.
- `ui/scene/draw-house.ts`: `paintPane`'s `Point & { r: number }` is
  geometry's `Circle`; the square window's glint is `SQUARE_SHINE`, shared by
  the shut pane and (mirrored) the open casements.

## Left (ambiguous, not applied)

- `ui/scene/house-worm.ts` `setOut` / `swinging`: the same three-line
  prologue (trip guard, `since`, `since >= 0`). Two callsites with different
  tails; a `sinceTap(t)` helper would save little. Recommendation: leave.
- `model/pinhole.test.ts` and `model/ground.test.ts` each declare
  `SAME_VIEW = 1e-9`, with different docs (views vs plane points). Test
  tolerances per file. Recommendation: leave.

Checks: worm, planter, tending, flower-sight, perch-sight tests; typecheck,
eslint, prettier, knip, type-overlap, lint:fsd — all green.
