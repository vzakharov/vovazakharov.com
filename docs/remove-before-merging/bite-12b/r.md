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

## Left

- R2 — the wash rule (§ 9).
- R3 — `openingCrop`, `rebloom` (a later agent's).
