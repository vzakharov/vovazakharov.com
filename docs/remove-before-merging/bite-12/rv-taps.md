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

- Finding 1: `play-approach.ts`'s cap tap point is `paintedCap`: the
  dome outline the painter fills (`headOutlines` → `capFrame` →
  `toCanvas(size)`), its genes grown Node-side from the mushroom's seed and
  species and splayed as `placeOf` stands its foot, through the graphics'
  world transform read off the page; the deepest grid point of it. A check
  that the Node-side turn equals the bed's guards the genes. tabL
  `--plays approach`: the cap tap and the outside tap pass; the only red is
  the frame budget (27.4 ms median vs 26), with other agents building on
  the machine at the same time — nothing this change runs per frame.

## Left (context ran out; a fresh agent continues)

- Finding 3 (`play-walk.ts`): not started. Found while reading: the
  reducer never holds a selection and an open flower picker at once —
  `tuft` and `flower` set `selected: undefined`, and `select` sets
  `planting: undefined` (`model/game.ts`). So "a mushroom selected and the
  flower picker open" has to be two baselines (one drag with a mushroom
  selected, one with the picker open on a tuft), or one of the two.
  The check per the review: the drag grows, plants and selects nothing
  (mushroom count, planted count, `selected` not set to a new id), while a
  shut picker / dropped selection is allowed. `TAPS` (`play-taps.ts`) is
  the current read; `BARE_START` the drag start.
- Finding 2 (`play-tufts.ts`, `play-hold.ts`, `play-keys.ts`): not started.
- Steps 3–5 each proven by one tabL `pnpm play:mushrooms --screens tabL
--plays <touched>` under `flock /home/user/vovazakharov.com/tmp/site.lock`
  (a build takes ~4 min).
