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

## Third agent: the live hills (uncommitted as source)

Stopped on the orchestrator's word (context) before the tests were rewritten,
so the source does not type-check yet and rides as
`p2-panorama-hills.patch` (`git apply` it on HEAD; the working tree also
holds it unstaged). What it does:

- `panorama.ts`: `Crest` (azimuth → screen y), `ringWave(camera, rate,
  phase)` — a sine that is exactly `rate·(x − cx) + phase` over the opening
  screen (via `F·tan α`), then a C1 Hermite in azimuth round the rest of the
  circle at the middle's pace, a whole number of turns round 360°;
  `crestAcross(crest, view, steps, margin)` samples a crest across a view.
- `skyline.ts`: `farSkyline` / `farthestSkyline` / `nearSkyline` return a
  `Crest`; `FarRange = {crest, highest}`; the bowl is one parabola at
  `α_sun` with `off = F·wrapAngle(α − α_sun)` (sweep and `PARTED_SAG` gone);
  `OPENING_SLIDE` (0.3/0.6/1) only phases each range so the opening view
  shows its old crests; `seamCrest` is the seam round the panorama;
  `groundSeam` kept for `grass.ts` (still via `layerSpan`); `hillBands`
  drops level runs (`withoutLevelRuns`).
- `paint-land.ts`: `hillsOf(layout, random)` (same `random` order), and
  `drawHills(layers, hills, view)` live into two screen-fixed Graphics, the
  seam filled `RANGES.near.foot` in the near layer down to `groundTop +
  reach + 2`. Ground/grain painters still the old ones.
- `paint-backdrop.ts`: `Backdrop.hills: {far, near}` Graphics +
  `hillsFrom`; `follow(view)` redraws them only when `view.eye.heading`
  changed. No change to the per-frame or resize API.
- `Span` moved to `baking.ts` (`parallax.ts` imports it from there).

To finish step 1: rewrite `skyline.test.ts`, `sun-layout.test.ts` (the
`shownAbove`/level-run checks) and `backdrop-tones.test.ts` `openSky` to
sample `crestAcross(crest, viewAt(camera, {...OPENING_EYE, heading}))`
over a heading sweep, the sun at `screenAt(view, azimuthAt(camera, sun.x))`.

### Measured (tabL 1180×820 @2, play run's SwiftShader Chromium, 80 frames, medians, 3 runs)

| | `game.step` JS | step + `readPixels` sync |
| --- | --- | --- |
| live hills, static | 7.9–8.3 ms | 237–313 ms |
| live hills, turning (redraw each frame) | 7.8–8.0 ms + 0.6 ms `follow` | 245–255 ms |
| hills hidden | 7.3–7.8 ms | 212–290 ms |
| baked strip (1.5 screens, 3540×615 texels), static | 7.3–7.6 ms | 244–270 ms |
| re-baking that strip | 95–137 ms per bake, every ~0.5 s at `TURN_CRUISE` | |

**Call: live.** The live hills cost ≈ 0.5 ms of JS a frame (Phaser
re-tessellating ~4.1k commands), static or turning; the synced raster cost is
the same as a baked strip's within noise. Baking would save that 0.5 ms but
hitch ~100 ms twice a second while turning.

### Opening match (old 0b32d8fb~ skylines vs new crests, 100 visits a screen)

Away from the old bowl, every range matches within 0.2 px (near), ≤ 1.8 px
(far, tablet; 0 on portrait/phone screens). Within ~8–16 sun radii of the
sun the far ranges differ by up to 24 px (tabL), 63 px (tabP), 33 (phone),
11 (phoneL), 54 (phoneS): the old long trough along the sun's crop sweep is
gone, so the far hills near the sun stand at their own height rather than
pressed down. Seam: ≤ 0.9 px.

### Step 2 (not started in source)

Draft: `paintGround` as 32 flat full-width rects from `groundTop − reach`,
each clipped to `y ≥ groundTop + reach` (today's band colours, seam fill
above), no mottles; `paintGrain` screen-fixed (`setScrollFactor(0)`, x 0,
width = screen) from `groundTop − reach`; then bakes are all factor 0, and
`layerSpan` leaves `paint-backdrop.ts`/`grain.ts`/`paint-land.ts`.
`parallax.ts` stays for `grass.ts` (`layerSpan`, `PARALLAX`) and
`skyline.ts`'s `groundSeam` (grass's seam). Screenshot pair not taken; the
0b32d8fb~ worktree was removed.

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
