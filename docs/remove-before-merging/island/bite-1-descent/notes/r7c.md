# R7c — a detail cut the tiles can hold, and the coast at orbit

Measure: `tmp/r7c/measure.ts` in the worktree (eye over (0,0) via `eyeAt` +
`withHeight` + `poseOf`, real coast, frustum + ground, as the scene selects).

## 1. Detail cut — done, pushed

- `model/split.ts`: `splitRule` and `viewDistance` are the one home; also
  `children`. `quadtree.ts` splits by `splitRule(eye, coast)`.
- `model/detail.ts`: `detailCut(eye, coast?)` = max over the unbalanced leaves
  of `splitRule` of `2·sp(L)·max(0, 1 − gap/(side_L/2))`, floored at
  `2·sp(MAX_LEVEL)`. Evaluated as: the leaf holding the point (straight
  descent), then only coarser leaves among the eight around each ancestor
  (pre-filtered to those within half their side of the holding leaf), cached
  per holding leaf. Split decisions memoised per closure.
- Cost per 33² grid (node, tsx): new 0.15–0.33 ms vs old 0.4–0.8 ms; fills
  unchanged within noise.
- Worker: `detailCut(eye, built)`.
- Tests: nadir cut equals the nadir tile's 2·spacing (6 eyes, orbit to 100 m,
  with coast); cut never finer than any coast-following selected tile's
  2·spacing at 10 km over the disc's shore; R4b's edge-agreement tests pass.

| height | desktop tiles | phone tiles | nadir cut before | after | nadir tile 2·sp |
|---|---|---|---|---|---|
| orbit | 60 | 60 | 128 km | 128 km | 128 km (L3) |
| 1000 km | 42 | 67 | 62.4 km | 32 km | 32 km (L5) |
| 10 km | 26 | 34 | 489 m | 250 m | 250 m (L12) |
| 100 m | 104 | 86 | 3.9 m | 3.9 m | 3.9 m (L18) |
| 2 m | 81 | 71 | 3.9 m | 3.9 m | 3.9 m |

## 2. Coast floor at orbit — next

## Play run — not yet
