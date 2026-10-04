# s3-walk-start — hand-over

Spec § 3 Step 3, `bite-18.md` call 6.

## Done

- `model/walk.ts`: `openingWalk(camera: Camera, from = OPENING_START): Walk`,
  `export type WalkStart = WithGait & Eyed` (`Eyed` from `model/ground.ts`);
  `OPENING_START` (module-private) is `{ eye: OPENING_EYE, gait: 'steps' }`.
  The rise opens settled at `gaitHeight(from.gait)`, so a flight start stands
  at the flight height from the first frame. `walk.ts` 449 → 451 lines.
- `model/walk.test.ts`: "the walk a visit opens on" — the bare call opens as
  before; a start opens on its eye (both gaits, every camera) at the gait's
  height at t = 0, one frame and 10 s. The `flying` helper now uses the start.

## Left

Nothing in this package. S2's record reuses `WalkStart` for its `eye` and
`gait`; step 5 passes the kept start through `EyeInput` to `openingWalk`.

## Decided

- `walk.ts` no longer imports `OPENING_RISE`; it stays in `eye-height.ts`,
  still used by `eye-height.test.ts` (knip passes).
