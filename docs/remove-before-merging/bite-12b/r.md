# Package R — hand-over

## Done

- **R1, the rim goes** — `model/stride.ts`: `GLADE`, `RIM_KEEP`, `REACH`,
  `fromCentre`, `onRim`, `toRim`, `meeting`, `walk`, `inGlade` gone; a held
  key's course has `room: () => Infinity` and steps `plus(at, way, by)`;
  `chaseRoom` is the chase's `left`, or `Infinity` when ≤ 0; `standingAt`
  stands where asked. `roomAhead` went too rather than returning `Infinity`:
  its only reader outside the module was the test, and `keyed` reads the
  constant directly. `model/stride.test.ts`: the rim and room-ahead cases
  went; the cruise cases stay; added "walks on with no end" and "stands where
  it is asked to".
  - `scripts/lib/play-walk.ts` (the play package's): the `GLADE`/`RIM_KEEP`
    import, `fromMiddle` and the "↓ held 12 s rests at the rim" check removed
    so it type-checks. Its replacement check (§ 3, "walks back
    `STRIDE_CRUISE` × (12 − eased)") is left to the play package.

- **R2, the wash rule** — `nearestTheSun`/`acrossFromSun` gone from
  `ui/scene/sun-layout.ts`, with the "out of the wash" rule in
  `meadow-rules.test.ts`. `washReach` is not exported, so its test in
  `sun-layout.test.ts` goes through `layout.wash`: at 41 columns across the
  outer ring, its lowest row stays at or above `browRow` there less the
  farthest place's `WASH_FOOT_CLEAR` (each place's size scaled to the brow,
  as `washReach` scales it). The spec named `browLowest`; `browRow` per
  column is the tighter claim (the brow is highest, at `groundTop`, mid
  screen), and still passes on every viewport.

- **R3, `openingCrop` and `rebloom`** — `openingCrop` gone from
  `ui/scene/visit-play.ts` (its `viewAt` import with it). `layout.test.ts`,
  `meadow-rules.test.ts` and `scripts/sweep-mushrooms.ts` pass
  `(layout) => viewAt(layout.camera, OPENING_EYE)` inline;
  `mushroom-patch.test.ts` already had `from(eye)`, which is exactly that, so
  its row reads `from(OPENING_EYE)` beside its `turned`/`stepped in` rows.
  `rebloom`, `BLOOM_WIDEST` (nothing else read it) and their `motion.test.ts`
  case gone from `model/motion.ts`. No off-limits file read either.

## Left

- Nothing: R1–R3 are the whole package.
