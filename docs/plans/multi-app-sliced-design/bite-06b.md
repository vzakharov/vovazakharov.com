# Slice 6b — the game cut by its nouns (#216)

The operator asked for 6b on 6a's PR: «я не вижу смысла приземлять этот слайс
отдельно от следующего -- разбиения "грибов" -- так как именно он покажет,
правильны ли были наши теоретизирования». The rules it was cut by are
`decisions.md` § "Cutting the game (6b)".

## The tree

- **`shared/`** — `lib`, `ui` (the palette, ink, haze) and `world`, what is
  about nothing in particular: the camera and the ground (`ground`, `pinhole`,
  `view`, `pan`, `walk`, `walking`), the world's clock (`dusk`, `weather`), the
  bed's depth order (`bed-place`, `repaint-queue`, `backdrop-depths`,
  `shelter-seats`), and the ground as the flower and the mushroom both occupy it
  (`anchored-ground`, `occupant`, `seat-reach`, `crowding`).
- **`entities/`** — `mushroom` (its genes, pose, light and house, its place in
  the clump, the meadow's camera, `Planted` and the sprout, `mushroom-cover`
  turning it into occupants), `flower` (its genes, layout, plots and sight, the
  picker's actions, `Stand<L, Thing>`), `insect` (its genes, the frame and
  timing of a flight, the perch vocabulary, its size), `landscape` (the lawn and
  the sky as one noun, the backdrop that paints both), `mouse`, `worm`.
- **`features/`** — named for what happens: `grow-mushroom` (sowing, sprouting,
  the patch, the spores), `plant-flower` (the child's planting, the tufts, the
  tending), `insects-fly` (perching, sheltering, the bee's pollinating, the
  firefly), `mice-run`, `worm-peeks`, `furnish-house`, `flowers-close`,
  `play-flowers`, `walk-meadow`.
- **`widgets/map`** — the map. It declares what it reads, `MapLayout`, the map
  button's place (`WithMap`) and the door seating it draws (`DoorSeating`), and
  the page takes those from its barrel.
- **`pages/mushrooms`** — the React shell and the whole it composes: the scene
  (`meadow-scene`, `start-game`), the state (`Meadow`, the `Action` union and
  `reduce` in `model/game.ts`), the controls, the sound, the keeping (`api/`),
  and the tests that check a lower module on the screens the page lays out.

## How the parts meet

- **A reader declares the layout it reads**, `<File>Layout`, from its owners'
  narrow types (`Sunned`, `Horizoned`, `Bedded`, `Clouded`, `InsectScaled`, …);
  the page's `MeadowLayout` is their intersection. `Stand<L>` and its parts are
  generic in the layout.
- **Each `Action` variant is declared by its dispatcher** (`TurnLight` by the
  dusk, `StartRain` by the weather, the picker's in `model/flower-planting.ts`),
  and each `MeadowSound` reader declares the voice it calls.
- **The flower and the mushroom meet only as occupants of the ground.** Each
  turns itself into `Occupant = { foot; cover }` and whoever composes the stand
  hands the list in, so neither imports the other. A decision needing both sits
  with the feature that has both in reach: `flower-room` in `plant-flower`,
  `bee-room` in `insects-fly`, `GrowingStand` in `grow-mushroom`.
- **`anchoredStand` shows every mushroom**, not only those within `STAND_REACH`,
  since a generic cache of the filtered list needs a cast; the ground lays out
  only those it shows. `pnpm test:meadow` passes, so nothing judges differently.
- **The page's tests enter a slice through `index.node-safe.ts`** wherever its
  `index.ts` re-exports a module that imports Phaser, which reads `window` on
  load and crashed 78 test files under bare Node.
- **The lawn's cell is `LAWN_CELL`**: the cut bound every import of `CELL` to
  the occupant grid's (0.02) in `shared/world`, so the seam and the map took the
  lawn's cell (4) 200 times too small. A comparison of every import's
  declaration against the base found no other import rebound to a different
  value.
- **The worm and the mouse take the house as a parameter**: `paintHouse` takes
  its tenants as painters, which the page's `house-view` composes.

## Proven by

- **The game's own tests**, all six shards green on vet's runners.
- **The plays, against the base**: the same 22 of 30 groups red on 6b's base as
  on its head, each with the same message down to the coordinates, so the cut
  changed nothing a play sees.
- **`test:meadow` is `scripts/vet-test.sh meadow`**, the game's layer list held
  in one place, and the caches' get-or-make is kernel's `keptIn` (both the
  operator's calls on `/polish`'s `/dry` findings).

## Moved by

`move.ts` and the tools in
`docs/remove-before-merging/masd/one-page-measure/layout-tools.md` moved the
tree; they read the pre-move layout, so eslint's `boundaries` and Steiger are
the layout's check now.
