# p1b-beds — hand-over note

Package: bite 12 P1, continued from `p1a-beds.md` (grass fix 81ffe900).
Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. 9e037bbe — `follow(view)` on `MushroomBed`, `FlowerBed` and `HouseView`,
   each `implements Following`. The per-object placement is `bed-place.ts`
   (`bedPlace(view, foot)`: `ofGround` position, `zoom`, `ahead`, depth =
   screen y, `drawn` = not `cull` and `fade` > 0, `alpha` = `fade`;
   `layoutPlace` for a bed no view has placed yet; `standAt` applies one).
   `bed-place.test.ts`: at `OPENING_EYE`, every opening and forest mushroom
   and seeded flower on every screen, upright and turned, stands at its
   layout place less the opening crop's left within 0.5 px, at zoom 1,
   drawn.
2. 57f86ae9 — a retap restarts a flower's bloom from the top
   (`FlowerBed.open` sets `tappedAt` to now; a key's answer does the same).
   No clock function, so no test. `PALETTE.sprout`/`sproutDark` removed.
3. The haze repaint queue, `repaint-queue.ts`: `hazeAhead(camera, ahead)`
   (the opening eye's haze on the ground row that far ahead, so the opening
   repaints nothing) and `repaintsDue` (drift ≥ `HAZE_DRIFT` 0.04, nearest
   first, at most `REPAINTS_PER_FRAME` 2). Wired into `MushroomBed.follow`;
   a mushroom repainted on a resize while following takes the view's haze at
   once. Light stays as painted. The selection's band and ring moved into
   `mushroom-selection.ts` to keep the bed under ~450 lines.

## The scene's per-frame contract

`mushroomBed.follow(view)` and `flowerBed.follow(view)`, then the beds'
`update(t…)`. `follow` sets position, depth, visibility and alpha and
repaints the haze due; `update` multiplies its motion scale by the zoom the
last `follow` left. Until the first `follow`, the beds stand as laid out
(world px), as before. The bed stands each house itself; `HouseView.follow`
is there for the `Following` contract.

`capTop`, `seat` and `answer`'s `shows(x)` stay in world px at the opening
eye (insects fly in layout space, step-spec "Insects").

## Left

Nothing in this package's steps.

## Decided / found

- **The fade band reaches into the opening frame.** `fade` starts at
  `FADE_FROM` 12.3 but the world's frame runs to D = 13.24, so back-row forest
  mushrooms fade at the opening (tablet: seed 42 one at alpha 0.57, seed 99
  one at 0.28; flowers none). `view.ts` is not this package's; the test
  asserts position, zoom and drawn, not alpha. Reported.
- Haze is by `ahead` (distance along the heading), not straight-line
  distance: it is what the opening's rows measure, so the opening is
  unchanged.
- Flowers carry no haze, so the queue serves mushrooms (and their houses)
  only.
- `Translucent` (`{ alpha }`) is homed in `ink.ts` and taken by
  `mushroom-light.ts`'s `ShadowLayer`, which `pnpm type-overlap` asked for.
- `rebloom` (`model/motion.ts`) and its test are now dead in production:
  `model/*` is not this package's, so they stay for its owner to remove.
- The restart snaps the head back to its rest size for a frame before it
  opens again: a retap at the bloom's widest shows a jump, as asked.
