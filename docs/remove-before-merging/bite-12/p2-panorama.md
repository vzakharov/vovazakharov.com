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

## Left

- Step 1 rest: sun disc/rays as their own small bake moved by
  `shiftOf(view, sun.x)` and hidden outside the view; the sun's halo
  (`litSkyAt`'s `SUN_HALO`) as an opaque lit-sky strip `sun.x ± max(0.4·short,
  3.5r)` over a rows-only sky bake (base-independent, seamless where the
  halo reaches 0); the wash baked over `sun.x ± outer` only, moved likewise;
  a `follow(view)` on the backdrop driving all of it.
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
