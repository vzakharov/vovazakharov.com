# tail-polish — hand-over

`/polish` over bite 12b: floor f680c86a (the last bare `polish:`), 266
commits, ~6.8k changed lines outside working notes. Refactors and prose only.

## Done

- Split `scripts/lib/play-insects.ts` (467 lines): the looks and waits every
  insect step shares (`fliersOn`, `landed`, `LOOK`, `MOST_LOOKS`,
  `REST_LOOK`) move to `scripts/lib/play-fliers.ts`; `playInsects` stays.

## Left

- `/dry` over the range, then `/tend-prose`.
