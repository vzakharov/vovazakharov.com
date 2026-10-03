# rh-f — T145, T146, T147 (tests)

## Done

- T145: `isShown` judges a posed place's plane distance from its eye against
  `far` (`roundFromEye`), an unposed one's `fromEye`. Test in
  `flight-in.test.ts` builds a real stand (`opened` + a cap at θ 0.75,
  d 14.25, seen through `Perches`), red before the fix.

- T146: `insect-drawn.test.ts` holds the side bend at x 20 on 844×390, y 300,
  turn −1.1: rotation within 0.01 of the placed step's way, ≥ 0.15 off the
  turn. Goes red (with the brow case) when the bend's sign is flipped.

- T147 (not `tufts.test.ts`): `ground-seam.test.ts` holds `hasGround` true to
  3.08 rad off the opening heading and false from 3.09, both sides, at
  0.5 / 3 / `D_SEE` / 40. `clump-layout.test.ts` asks `laidOf` of the foot as
  each eye moves it, and has it laid the same. `mushroom-light.test.ts`'s two
  heading tests hold the closed form: across share `sin(α − heading)`, `α` =
  `asin` of the opening's, 0 facing the sun, height kept (red with
  `headedLight`'s sign flipped).

## Left

- Nothing. The bed-repaint test has no seam without opening production code:
  the beds are Phaser classes no test builds, and the scene answers an anchor
  change only with `perches.see` (`meadow-scene.ts`); a bed repaints through
  `paint` (layout or resize) or `repaintsDue` (haze, sun side, chords — all of
  the view). The one pure part, `laidOf` taking no anchor, is the
  clump-layout case above.

## Decided

- An unposed `Place` (hand-built in tests, away spots) keeps `fromEye`: it
  carries no plane point to measure round the eye.
- T146 at turn −1.1, not +1.1: at x 20 on 844×390 a turn of +1.1 (facing in
  toward the middle) is bent only 0.06–0.12 rad (y 100–380), under the 0.15
  bar; −1.1 (facing out past the side) is bent 0.16–0.21, the reviewer's
  "up to 0.20". The mirror, x 824 at +1.1, is the same case.
