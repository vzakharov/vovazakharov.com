# Bite 9, step A (frame per screen, flowers in it, fill): where it stopped

Done, all type-checking (bar `layout.test.ts`) and pushed: 8b2483c (frame
per screen and its turn, `meadow-camera.ts`, `roomFor` on two screens),
0e58a9c (seeded flowers in the frame, `FORESHORTENING` derived), 3bb36c7
then fd46120 (`flowerFeet` wired; `clearOfFlowers` tried and backed out for
the 0.2 foot distance, see `fill.md`), 3a1ef9f (`ROUNDS` 32), 7884c6a
(`fill.md`), 9ae907b (`flower-plots.test.ts` in 22 s, two test fixes).

Left:

1. `flower-plots.test.ts` is red in 3 cases: with the forest grown to six,
   the bees plant a median of 3 (phone, tablet upright) and 2 (small phone)
   against `LEAST_PLANTED` 4. Operator's call: fewer mushrooms, a lower
   floor with a full forest, or ring slots the forest keeps off.
2. The small phone reaches six in 69% of visits (`fill.md`).
3. The other mushroom suites were not run to the end: all of them in one
   call passed 9 minutes; run them in chunks.
4. eslint/prettier ran clean on every touched file; `type-overlap`, `knip`
   not run.
