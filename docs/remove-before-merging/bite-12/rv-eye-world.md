# rv-eye-world — fixes for review 5391045656

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "eye-and-world — review 5391045656".

## Done

- Finding 2 — `groundSeam` / `seamAt` deleted from `skyline.ts`, header and
  `seamCrest` docstring corrected. The two tests that read `groundSeam` keep
  the contracts they guarded on what draws: the "wavers" test samples
  `seamCrest` across the opening view as `drawHills` does, and the grain test
  starts the strips at `groundTop − seamReach`, as `paintGrain` does.

## Left

- Finding 1 — the bob and the brow.
- Finding 3 — `Controls` callbacks out of `meadow-scene.ts`.
