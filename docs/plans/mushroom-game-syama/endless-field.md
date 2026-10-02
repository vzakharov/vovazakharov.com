# Item 12b — the endless field

The 12b bite's contract, moved verbatim out of the plan's `## Rest of the elephant`.

12b. **The meadow has no edge** («ну да, бесконечный»): bite 12's glade
rim (`GLADE` in `model/stride.ts`) goes, and the field runs on wherever the
child walks. **Nothing grows on it but grass until the child plants it**:
the opening clump and its seeded flowers are the whole of what the game
sows, and every other mushroom and flower is his («ничего кроме стартовых
двух грибов и скольки-то там цветков быть не должно, всё остальное ребёнок
засевает сам… там пустое поле пока он туда что-то не посадит»). The grass
is the field's, laid as the child walks, every tuft a planting spot by
bite 12's rules (`tufts.ts`), judged where the child stands rather than at
the opening eye. The map (item 15) shows the surroundings rather than a
whole world, and helps the child find his way back to his own mushrooms;
the twelve-mushroom cap becomes a cap per area. The operator plays only
the finished game, so bite 12's rim is never something a child meets.
What it takes:

- **The store on the plane.** `Ground {x, z}` cannot write a point behind
  the opening eye, so stored positions (`Planted.foot`, the flower feet,
  `pickFoot`'s candidates) become plane points, the layout keeping the
  opening frame for the clump only; `+` and planting work anywhere in front
  of the child (`roomFor` already judges the screen by the view), and the
  patch and room rules judged at the opening eye move to the current one.
- **Light by heading** through bite 12's repaint queue (a high sun, side
  component `sin(heading − α_sun)`), and the ground's **mottles as objects
  on the plane**, over bite 12's screen-fixed rows.
- **The insects on the plane.** Legs with height, air spots round the eye,
  entry from the view's edge, take-offs panned by azimuth; the layout-px
  adapter in `insect-view.ts` retires, and with it bite 12's accepted cases
  (a leg ending behind the eye hidden for that stretch, a release facing
  away flying in unseen, `onscreenOf`'s x-only test).
- **Clear-outs bite 12 left:** `sun-layout.ts`'s
  `nearestTheSun`, alive only for `meadow-rules.test.ts`; `visit-play.ts`'s
  `openingCrop`, which returns a `View`; `model/motion.ts`'s `rebloom`, dead
  since a retap restarts.
- **Open for the operator:** what replaces the twelve-mushroom cap once the
  whole field can be sown.
