# tail-lod — a mushroom's point counts follow its drawn size

Stopped at the 170k context line, before the measure step. Nothing in
source yet: the whole change is `tail-lod.patch` beside this note
(`git apply` from the repo root; it type-checks, `pnpm typecheck` green).

## Where the entries come from (one mushroom, measured)

Counted with a fake Graphics recording Phaser's command-buffer entries
(a `fillPoints` of n points is 3n + 3, a `fillCircle` ~10 entries but ~101
points once Phaser expands the arc):

| species     | entries | points | biggest part                                |
| ----------- | ------- | ------ | ------------------------------------------- |
| fly agaric  | 7551    | 3025   | stem light 3975 / 1303; spots 1752 / 1160   |
| porcini     | 7592    | 2454   | stem light 3975 / 1303; dome 1350           |
| chanterelle | 11931   | 3884   | trumpet (inks, lip, ridges) 5307; stem 3975 |
| russula     | 7059    | 2278   | stem light 3975 / 1303; dome 1350           |

The stem's light is 21 stacked crescents of 58 points each — over half of
every dome species. Phaser's own `pathDetailThreshold` is already 1 device
px, so the render-time skip is in force and does not help further.

## What the patch does

- `curveSteps(drawn)` in `model/mushroom-profile.ts`: chords to a curve for
  a mushroom drawn `drawn` px to its unit, `ceil(drawn / 3)`, floored at 8,
  capped at `CURVE_STEPS` 28 (full from 84 px/unit). `detailed(full,
steps, least)` scales any other count with it. The one place a size maps
  to detail.
- Every outline the painter uses takes an optional `steps` (default
  `CURVE_STEPS`, so tap areas, `capReach`, door sight and tests are
  unchanged): `stemOutline`, `domeArc`, `headOutlines`, `trumpetOutlines`,
  `mouthEdges`, `ridgeLines`, `capLight` and its arcs, `shadedHalf`,
  `ellipse` (geometry).
- `stemLight(lit, steps)`: fewer layers, each more opaque so the edge stands
  as dark (`1 - (1 - a)^(count/kept)`); exactly the old layers at full.
- Spots: `fillCircle` at full detail (unchanged), a `detailed(ROUND_STEPS)`
  polygon below it; the shine's `fillEllipse` smoothness scales from 32.
- `MushroomBrush.steps`; `drawMushroom(..., { steps })`; `paintLit` paints at
  `stepsHere(shown) = curveSteps(size * stands.zoom)` and keeps `shown.steps`.
- Repaint: `repaintsDue` also takes a mushroom whose `steps` now differ from
  its painted ones (`Detailing`, optional, so flowers are untouched). One
  chord per step, so a mushroom walked toward is repainted every ~3 px/unit
  of growth, ≤ 2 repaints a frame as before. `mushroom-bed.ts` 407 → 414.

Counted after (seed 1): at 8 steps fly agaric 1704 entries / 514 points,
porcini 1703, chanterelle 2886, russula 1530 — about 4.5× fewer; at 17
steps about half.

## What is left

1. The patch's new `model/mushroom-profile.test.ts` fails one test: it asks
   every painted outline lie within 1 px of the full one at every size. The
   porcini/russula **band** (`gillsOutline`, index 1) is off 0.036–0.040
   units at 8–10 steps — 1.06 px at 28 px/unit; cap and stem are within
   0.02 and 0.002. Options: give the band its own floor (it is sampled
   `steps * 2` by angle and its collar kinks), or a smaller `CHORD_PX`
   (2.5). Measure which, then commit the source.
2. A `stemLight` test in `mushroom-light.test.ts`: full steps equal
   `STEM_LIGHT`; fewer keep the edge's combined opacity.
3. Run `mushroom-outline`, `chanterelle-outline`, `mushroom-light`,
   `house`, `mushroom-pose`, `mushroom-genes`, `repaint-queue`,
   `icon-genes` tests; prettier, eslint.
4. Measure: phoneL `approach` (bar: median under 26 ms; before 31.1 /
   30.7), phoneP `approach`, tabL `species`; look at the far forest before
   and after, commit frames `phoneL-lod-*.png`.
