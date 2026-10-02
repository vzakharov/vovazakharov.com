# Package fbed (tail) — hand-over

## Done

- **Split `flower-bed.ts`** (489 → 422 lines), no behaviour change
  (`refactor(mushrooms): split the shown flower out of its bed`). New
  `ui/scene/flower-shown.ts` (108 lines), mirroring `mushroom-shown.ts`,
  holds `Shown` (the type), `laidOut` (where the bed lays a standing flower
  out), `unplacedShown` (the object `show` builds; the bed still makes the
  container, stem, head and hit circle and passes them in, and wires the
  head's input) and `paintShown(shown, genes, size, openingLight, heading)`
  (builds its `FlowerPainting`, paints it lit, keeps `headY`, `disc` and the
  tap reach). The bed keeps `flowerLight` (it holds the layout's sun and
  lighting), `seat`, `stand`, `follow` and `drinkingAt`. `draw-flower.ts`
  untouched.

  Tests green: flower-layout 50, flower-plots 26, flower-sight 7,
  flower-hold 3, keyed-flowers 21, insect-seat 6, insect-drawn 3, perches 5,
  mushroom-light 48, repaint-queue 27; typecheck, eslint, prettier,
  `pnpm type-overlap` clean.

## Left

Nothing in this package.
