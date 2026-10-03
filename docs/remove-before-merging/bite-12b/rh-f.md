# rh-f — T145, T146, T147 (tests)

## Done

- T145: `isShown` judges a posed place's plane distance from its eye against
  `far` (`roundFromEye`), an unposed one's `fromEye`. Test in
  `flight-in.test.ts` builds a real stand (`opened` + a cap at θ 0.75,
  d 14.25, seen through `Perches`), red before the fix.

## Left

- T146, T147.

## Decided

- An unposed `Place` (hand-built in tests, away spots) keeps `fromEye`: it
  carries no plane point to measure round the eye.
