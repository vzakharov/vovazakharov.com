# redfix — hand-over

Three things red on HEAD: the tablet forest tap floor in `mushroom-patch.test.ts`,
two ESLint errors in `mushroom-room.test.ts`, Prettier drift in
`backdrop-tones.test.ts` and `pan.test.ts`.

## Done

- ESLint in `mushroom-room.test.ts`: `counted()` owns its `fitting` flag and
  returns it; the roomless finder is typed `(): undefined` with no return.
- Prettier over `backdrop-tones.test.ts` and `pan.test.ts`.

## Left

- The tablet forest tap floor (bisect in progress).
