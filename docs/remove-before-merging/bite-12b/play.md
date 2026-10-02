# Package play — hand-over note

## Done

- `play-walk.ts`: the rim check is replaced by `checkBack` — `↓` held 12 s
  walks straight back `STRIDE_CRUISE` × (12 − `KEY_EASE`/2) by the let-go
  and `STRIDE_CRUISE` × 12 at rest (the glide out gives the ease's half
  back), ±0.05. Green on tabL (19.000 / 19.200).
- `play-approach.ts`: the dense forest — `+` until it refuses, `↓` 4 s back,
  `+` until it refuses again, then the walk up and a full turn there.
- The probe times every `Grass.tend` and the scene's `see`
  (`__probe.hitches()`); the approach notes them against the frames that
  carry none.

- The approach's walk-up stops at `CLOSE` × the size the mushroom set off
  at, not its opening size: walked up to from behind the opening, a clump
  mushroom at 1.5× its opening size stands ~5.7 ahead, drawn below the
  screen's foot (a harness red, loosened). Green on tabL.
- Measured on tabL (machine at load ~5 on 4 cores): re-tend call median
  17 ms (slowest 151), its frames median 49 ms against 19 for frames with
  neither; re-sight call median 14 ms (slowest 39), its frames 25 ms.
- Hand checks in `to-check.md` § "Пакет прогона 12b".

## Left

- Only tabL was played. Reds that are other packages': on the walk play,
  after ↓ 12 s puts the eye 19 units off the opening, "a mushroom grown from
  `+` is not selected" (S3's `roomFor` from the eye) and "none of 0 tufts"
  (L3, the lawn's rules at the opening eye). The dense forest stands 12
  until S3's per-area cap lets the second cluster grow.
