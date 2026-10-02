# rv-taps — review 5391057365 (taps-flowers-harness)

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "taps-flowers-harness".

## Done

- Finding 5: `HouseView.follow`, `implements Following` and the `foot`
  parameter deleted (the one caller, `MushroomBed`, drops the argument).

- Finding 4: `flower-cover.ts` (new, pure, tested): each mushroom the
  frame draws, its `standingAt` outlines drawn about its foot through
  `bedPlace` + `aboutFoot` (as `mushroom-room`'s `keptOff` maps them), and
  `inSightPast`, which hides a point under a mushroom standing nearer the
  eye. `FlowerBed.inView` drops a flower whose head's middle is hidden;
  `Grass.inView` (`tufts.ts`, the planter's `tufts()`) drops a tuft whose
  middle is hidden. The planter gets no view of its own (that wiring is in
  `meadow-scene.ts`, off limits), so the tuft filter lives in `Grass`,
  which holds the view and now keeps the stand it was last tended to.
  `flower-sight.ts`'s `Cover` and the new `ShownCover` share
  `BoxedOutlines` (type-overlap).
  - Decided: a mushroom still growing in covers with its full-grown outline.

## Left

- Findings 1, 3, 2.
