# b3-b9c — call 14's stitch on film (partial: Vova's sand band judged first)

Looked at 9e01421e (after the stitch) and 706ce67d (`island/round-world` just
before the b9a merge, built in a scratch copy) through B8b's driver, extended in
`b3-b9c/look.ts.txt`: same CDP helpers, 1440×900, plus a `Worker` spy that logs
every fill asked and every tile got with its `fillMs`, and runs (descent, turn,
glide) that are written but not yet flown. `b3-b9c/before/` holds the 706ce67d
frames.

## 0. Vova's "склейка": a lowland floor, not a seam

`#1@10.35272,-0.47434,121.6,16.1,10.2,0.000`, `tiles 17 (6–17)`. Frames:
`0-vova-sand-121m.png` (after), `before/0-vova-sand-121m.png` (before),
`0-vova-sand-121m-tiles.png` (tile edges red, level changes yellow, the lowland
floor blue, from `sand.ts.txt`, which re-runs the page's selection in Node and
casts a ray per 4 px).

**The flat band is ground clamped to the lowland floor** (`relief.ts`:
`smoothMax(height, lowland, lowland)`, `LOWLAND_METRES` 15 approached over 5
km). There, ~560–590 m from the coast, the floor is 15·(1 − e^(−0.115)) ≈ 1.6
m, and the noise's troughs sink below it, so the ground is a flat sheet at 1.6 m
with no relief and no shading. The ray probe down the centre column reads ground
1.63 / 1.60 / 1.58 m at y 560–580 (distance 810–730 m), then the ridge in front
at 22.7 m (y 590). Its near edge is that ridge's silhouette; its far edge is
where the noise climbs back over the floor, with the 1.6 m rounding band (k =
the floor itself) too narrow to soften it.

Why it is not the stitch, a mixed cover, the skirt or the `finest` caveat:

- **The blue mask is the band, pixel for pixel, and tile edges cross it
  obliquely** (yellow 14/15 and 15/16 edges run through it, not along it).
- **Before and after are the same picture**: 5,130 pixels differ, by at most
  20 grey levels, scattered; the band is in both.
- **The drawn heights equal the full-detail ones** there (1.63 vs 1.63 m): the
  cut (13–19 m at those distances) removes nothing from a flat sheet.
- The frame is a settled cover (`setHeight` resolved), so no stand-in.

"A softer step near the green" is the land colour by height (`land-colour`),
which turns green as the ground climbs past the band; no tile edge follows it.

Fix options (a terrain call, not call 14; none tried):

1. **Widen the floor's rounding**: `smoothMax(height, lowland, k)` with k ≈
   5–10 m instead of 1.6 m. The flat stays flat but its rim rounds over ~k/slope
   metres (slopes here ≈ 0.1, so 50–100 m), removing the crease. Cheap; the
   floor still has no texture.
2. **Ride the finest octaves on the floor**: add the octaves ≤ 25 m
   (2.5 + 1.25 + 0.6 m amplitude, ≈ 4.4 m at most) after the clamp, scaled by
   `lowland / LOWLAND_METRES` so it vanishes at the coast. The floor then has
   the same fine grain as the dunes around it. At 570 m inland the scale is
   0.11, ≈ ±0.5 m — not enough to texture it; scaling by the floor's own
   approach is what keeps sea from showing inland, so this needs a floor above
   the ripple's depth, which is option 3.
3. **Raise the floor near the coast less steeply but keep relief**: a floor
   that is `max(lowland, ...)` of a smoothed copy of the noise (its octaves ≥
   400 m) rather than a constant, so troughs bottom out on a gently rolling
   surface. Costs one extra partial noise evaluation per sample (≈ the regional
   octaves, 8 of 17).

## Left

- § 1 of the brief: the 1,000 km speckle frames (`speckle` group in the
  driver, B8b's hashes) after and before, with the outlier maps; the 10 km
  hillside on #2 (`HILL=` env, spot not yet picked).
- § 2: the runs (`run:hill-…`, `run:coast-…`; look +14 gives B9b's 30° pitch
  at 10 km — the driver's `-30` default must be changed to `14`) and the fill
  and churn table from `tmp/look/data/*.json`.
- Builds: after = `sites/vova/out` of this worktree; before = a scratch copy of
  706ce67d (`git archive`, `pnpm install --offline`, a PATH shim answering
  `next.config.ts`'s `git rev-parse`).
