# rh-f — T145, T146, T147 (tests)

## Done

- T145: `isShown` judges a posed place's plane distance from its eye against
  `far` (`roundFromEye`), an unposed one's `fromEye`. Test in
  `flight-in.test.ts` builds a real stand (`opened` + a cap at θ 0.75,
  d 14.25, seen through `Perches`), red before the fix.

- T146: `insect-drawn.test.ts` holds the side bend at x 20 on 844×390, y 300,
  turn −1.1: rotation within 0.01 of the placed step's way, ≥ 0.15 off the
  turn. Goes red (with the brow case) when the bend's sign is flipped.

## Left

- T147.

## Decided

- An unposed `Place` (hand-built in tests, away spots) keeps `fromEye`: it
  carries no plane point to measure round the eye.
- T146 at turn −1.1, not +1.1: at x 20 on 844×390 a turn of +1.1 (facing in
  toward the middle) is bent only 0.06–0.12 rad (y 100–380), under the 0.15
  bar; −1.1 (facing out past the side) is bent 0.16–0.21, the reviewer's
  "up to 0.20". The mirror, x 824 at +1.1, is the same case.
