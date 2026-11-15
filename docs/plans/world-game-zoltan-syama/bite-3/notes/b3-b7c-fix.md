# b3-b7c-fix — height over the ground; a frame before the shot

Base 349174f2, branch `wt/b3-b7c-fix`. Not looked at in a browser.

## Done (pushed)

- **d66f81f4** the copied height. `globe-eye.ts` exports
  `heightOverGround(eye, groundAt)` = `floor + height − surfaceAt(at)` (the same
  sea-clamped surface `step` and `eyeAt` use), through the eye barrel.
  `poseOfEye(eye, hours, groundAt)` records it; `island-scene.ts`'s `where()`
  passes the scene's `groundAt`. `eyeOfPose` is unchanged: `eyeAt` puts the
  floor on the surface, so a pose's height is already the height over the ground
  — the exact inverse. New test: floor 0 under a 1,998 m hill, eye 2,000 m up →
  pose height 2, reopened at the same altitude.
- **b6378918** `shoot` in `scripts/lib/play-tab.ts` steps `frames − 1`, awaits
  one `requestAnimationFrame`, then takes the last step (evaluated with
  `awaitPromise`), so the shot's render falls in a fresh animation frame and
  three's light uniforms carry the current sun.

## Checks (b6378918)

107 tests over `pages/island/lib` and `features/eye/model`; tsc (vova, root);
eslint, prettier on the touched files; check:masd, check:cycles, masd:clusters,
type-overlap, check:poison, line-limit — green. knip red as expected until B8;
`heightOverGround` is not in its list.

## Left

- Item 2 is unproven in a browser: replaying look2's `gap` probe through `shoot`
  should give the dark (15.6/25.1/23.2) frame on the first shot.
- Before a new world's field lands, `where()` measures against the old world's
  `groundAt`, which is also what the eye stands on then, so the copy is
  consistent with the frame shown.
