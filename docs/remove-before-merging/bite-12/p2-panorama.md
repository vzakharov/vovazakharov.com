# p2-panorama — hand-over note

Package: bite 12 P2, the panorama. Stopped partway through step 1 on the
orchestrator's word (context).

## Done (this commit)

- `panorama.ts` (new, pure) + `panorama.test.ts`: `wrapAngle`, `azimuthAt`
  (opening x → azimuth, `atan((x − cx)/F)`), `screenAt(view, α)` (`cx +
F·tan(α − heading)`, `undefined` behind the eye), `shownAzimuths(view)`,
  `shiftOf(view, x)` (how far a picture baked round opening x moves),
  `Cloud` (`{azimuth, y, r}`), `skyClouds(camera)` (the 3 opening clouds at
  their opening azimuths + 5 round the rest of the sky, fixed seed),
  `driftedAzimuth` (drift is angular, `speed/F` rad/s). Tests: opening
  identity for the sun and the 3 clouds, the 5 off the opening screen, a
  full turn returns the sun, a half turn hides it.
- `layout.ts`: `clouds` is `Cloud[]` from `skyClouds`.
- `paint-sky.ts`: clouds lean toward the sun along the panorama
  (`F·wrapAngle(α_sun − α)`; sub-pixel off today's lean on the opening).
- `paint-backdrop.ts`: `driftClouds(backdrop, layout, t, view?)` places
  each cloud by azimuth through `view` (default the opening view) and hides
  it behind the eye or off screen.
- `sun-layout.ts`: `washReach` lost its every-crop bound and the land's
  third; the wash stays above `groundTop`, short of the farthest foot's
  clearance (a bound that holds from every eye, see Decided).

## Done (second agent)

- Clouds by density (`skyClouds`): each opening cloud leads a lane spaced
  evenly round the sky, `ceil(2π / view span)` clouds a lane, no farther
  apart than the opening view is wide, drifting together at the leader's
  pace (`Cloud.drift`, rad/s; today's 7/4/5.5 px/s at the middle). So every
  heading at every time shows ≥ 3 cloud middles (sweep: min 3, mean
  3.05–3.27, max 5 on every `VIEWPORTS` screen). 18 clouds (phone sideways)
  to 60 (tablet portrait). The round clouds are shaped from their own
  stream (`PUFF_SEED`), so the backdrop's `random` stream after the clouds
  is as before 0b32d8fb (that commit's 5 extra clouds had shifted the
  hills). A cloud is pale when it is in the top tenth of the screen (was:
  the single highest), the same three-cloud opening.
- Step 1 rest (code, unit-tested; not yet screenshot-compared): `paintSky`
  is rows only (`skyAt`); `paintGlow` paints `skyGrid`'s cells with
  `litSkyAt` over `sun.x ± haloReach` (new in `backdrop-tones.ts`, the
  largest `SUN_HALO` reach, = max(0.4·short, 3.5r)), unclamped past the
  screen, baked on whole device pixels (`onPixels`, `baking.ts`); the sun
  (`paintSun`) baked over `sun ± (1.8r + 2 px)` (tablet: 225 CSS px
  square); the wash over `sun ± outer ring`, rows from the top. Each is a
  `Turning` picture slid by `placedLeft(view, sun.x, home)` (`panorama.ts`,
  `shiftOf` plus off-screen hiding). `Backdrop` is `Following`:
  `backdrop.follow(view)` places glow, sun, wash and clouds;
  `driftClouds(backdrop, layout, t)` (the scene's existing call) sets the
  drift and places clouds through the last followed view. A repaint keeps
  `view.eye` and `drifted`. Depths renumbered -9..-1 (sky, glow, sun,
  clouds, far, near, ground, wash, grain).

## Left

- Step 1: the `/preview` pair at tablet landscape against a 0b32d8fb~
  worktree (`docs/remove-before-merging/frames/bite-12/sun-opening-*.png`).
  Expected differences: the wash no longer reaching the land's top third
  (0b32d8fb's spec-sanctioned cut); possibly ±1 level at the sun's
  antialiased edge (it is now composited over the sky rather than baked
  with it).
- Step 2: periodic crests in `skyline.ts` (integer cycles round 360°,
  `k = round(waves·πF/width)`), one bowl at `α_sun` (`off = F·wrapAngle(α −
α_sun)`; screen offset ≥ that, so the old bowl's clearance still holds),
  live Graphics over `shownAzimuths` in `panorama.ts`, redrawn on heading
  change; `hillBands` with flat runs collapsed to cut vertices; the seam as a
  periodic crest drawn in the near-hills layer (near.foot fill).
- Step 3: ground as flat rows from `groundTop + seam reach` (colour-matched
  to near.foot, so no line), no mottles, grain screen-wide.
- Rewrite `sun-layout.test.ts` / `skyline.test.ts` crop sweeps as heading
  sweeps once step 2 lands.

## Decided

- The wash keeps a bound over every eye: any visible foot is at or below
  `groundTop`, and a place's size scales with its height below the horizon
  row, so the farthest foot (size rescaled to the seam row) bounds all.
  Stricter than the spec's `≤ groundTop − sun.y`; keeps `meadow-rules` and
  `sun-layout` wash checks passing.
- Shims kept: `nearestTheSun` (meadow-rules.test.ts), `WASH_FOOT_CLEAR`.
  `parallax.ts` untouched (grass.ts, baking.ts, skyline/grain/paint-land).
- Interim: until the scene passes a view, everything places at the opening
  view; clouds now drift round the whole sky, so the opening screen empties
  of clouds after a minute or two and refills only as the round ones come by.
