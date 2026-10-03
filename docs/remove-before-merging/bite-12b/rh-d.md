# rh-d — T144, bees plant where the child sees it

## Done

- `roomFor` (`flower-sight.ts`) offers a ring slot only when every head a
  flower planted there could grow (`sightingsAt`: every bend, petal and
  centre), widened by the sway, stands between the screen's sides as the
  anchor sees them (`screenSides`: the opening crop's middle ± `focal ·
tan(x / focal)`, the same sides `onscreenOf` in `perch-sight.ts` reads).
  `plantable` is unchanged, so the child's planting (`roomIn`, `takesFlower`)
  is untouched.
- `flower-sight.test.ts`, "a bee's planting": on small phone (320×568) and
  phone (390×844), 12 visits × 3 anchors (the opening eye and two walked),
  planted out by bees on every standing flower, seen or not: every planted
  head inside the sides. Fails on both screens with the screen check off.

## Births, 40 s, 4 bees at the opening (`--plays` scratch play, not committed)

| Screen | Before: born | Before: off or across a side | After: born | After: off |
| ------ | ------------ | ---------------------------- | ----------- | ---------- |
| phoneS | 21           | 17                           | 9           | 0          |
| phoneP | 19           | 14                           | 6           | 0          |
| tabL   | 20           | 3                            | 15          | 0          |

Frames: `docs/remove-before-merging/frames/bite-12b/handling/*-bees-after-end.png`.

## Left

Nothing in this package. `screenSides` duplicates the half-width
`onscreenOf` computes in `perch-sight.ts` (off limits here); that one could
read `screenSides`.
