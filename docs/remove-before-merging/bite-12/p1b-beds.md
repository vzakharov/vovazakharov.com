# p1b-beds — hand-over note

Package: bite 12 P1, continued from `p1a-beds.md` (grass fix 81ffe900).
Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. `follow(view)` on `MushroomBed`, `FlowerBed` and `HouseView`, each
   `implements Following`. The per-object placement is `bed-place.ts`
   (`bedPlace(view, foot)`: `ofGround` position, `zoom`, depth = screen y,
   `drawn` = not `cull` and `fade` > 0, `alpha` = `fade`; `layoutPlace` for a
   bed no view has placed yet; `standAt` applies one). Tested in
   `bed-place.test.ts`: at `OPENING_EYE`, every opening and forest mushroom
   and seeded flower on every screen, upright and turned, stands at its
   layout place less the opening crop's left within 0.5 px, at zoom 1,
   drawn. Nothing calls `follow` yet.

## The scene's per-frame contract

`mushroomBed.follow(view)` and `flowerBed.follow(view)`, then the beds'
`update(t…)`. `follow` sets position, depth, visibility and alpha; `update`
multiplies its motion scale by the zoom the last `follow` left. Until the
first `follow`, the beds stand as laid out (world px), as before. The bed
calls each house's placement itself; `HouseView.follow` is there for the
`Following` contract.

`capTop`, `seat` and `answer`'s `shows(x)` stay in world px at the opening
eye (insects fly in layout space, step-spec "Insects").

## Left

- Step 2: retap restarts a flower's bounce; `PALETTE.sprout`/`sproutDark`.
- Step 3: the haze repaint queue.

## Decided / found

- **The fade band reaches into the opening frame.** `fade` starts at
  `FADE_FROM` 12.3 but the world's frame runs to D = 13.24, so back-row forest
  mushrooms fade at the opening (tablet: seed 42 one at alpha 0.57, seed 99
  one at 0.28; flowers none). `view.ts` is not this package's; the test
  asserts position, zoom and drawn, not alpha. Reported.
