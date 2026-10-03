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

## tail-lod2

### Step 1 — the patch in source

- **The gill band keeps every chord** (`BAND_STEPS = CURVE_STEPS` in
  `mushroom-profile.ts`, used by `gillsOutline`'s band). A floor below 28
  does not hold the 1 px bound: the band's error is set by where its samples
  land on the collar notch round the stem (sampled by angle, sparsest
  there), not by chord length, so it does not fall with more chords —
  measured worst over 10 seeds, porcini and russula: 0.036 units at 8
  chords, 0.030 at 17, 0.021 at 24, 0.015 at 27. With `curveSteps` as is,
  any floor from 8 to 16 leaves 1.52 px at 51 px/unit, 20 leaves 1.47 at 72;
  a shorter chord everywhere needs 2 px to reach 1.01. Cost: the band is
  57 points at every size instead of 17 at the floor, ~120 of a far
  porcini's ~1700 buffer entries.
- `Chorded = { steps }` in `mushroom-profile.ts`, shared by `MushroomBrush`,
  `Shown` and `Detailing` (`pnpm type-overlap`).
- `stemLight` test in `mushroom-light.test.ts`: full chords give
  `STEM_LIGHT`; 8, 14, 20 chords keep fewer layers per side with the same
  combined opacity over the edge and the same depth span.

### Step 2 — measured on 567702f, one play per call, alone on the container

| screen, play      | frame-JS median                                    | before (tail-phoneS) |
| ----------------- | -------------------------------------------------- | -------------------- |
| phoneL `approach` | **18.4 ms** over 918 (bar 26), neither-frames 17.8 | 31.1 / 30.7          |
| phoneP `approach` | 11.1 ms over 918                                   | 12.2                 |
| tabL `species`    | 17.4 ms over 445, green                            | —                    |

Load 0.5 before the phoneL run (its own build included), ~4 during each play.
The multi-second single stalls (slowest 3.5 s phoneL, 4.4 s phoneP) are the
container's, as on every earlier run.

The parent (8a3cd25), built and played the same way right after:
**30.0 ms** (neither-frames 28.8), red against the bar. So 30.0 → 18.4 on
one container in one sitting.

### Step 3 — looked at

Frames from the `approach` play's last screens, before (8a3cd25) and after
(567702f), same seed:

- `phoneL-lod-far-forest-before-after.png` — the far forest at the brow,
  2×, before on top. No difference to the eye: caps round, fly agarics and
  russulas spotted, porcini and chanterelle each read as themselves. The
  frames differ in 46 551 of 2.96 M pixels, all sub-pixel edge shading.
- `phoneL-lod-caps-zoom-before-after.png` — mid-distance caps in the walked-in
  frame at 3× pixel zoom, before left: indistinguishable (145 258 pixels
  differ by a shade). The close, turned frame is pixel-identical (all at 28).
- `phoneL-lod-forest-after.png` — the whole forest frame, after.

Neither the floor (8) nor the chord (3 px) visibly hurts, so neither was
raised. **Not seen frame by frame:** a mushroom popping between levels on
the walk — the play keeps only its last frames. What holds it is
`mushroom-profile.test.ts`: every painted outline lies within 1 px of the
full one at every size, so one chord's change moves an edge by under a pixel.
The stem light's layer count and the spots' polygon also step with the
chords, and are not covered by that bound; at these sizes they show nothing.

### Left

Nothing in this package's list. For review: the band at full chords (above).
