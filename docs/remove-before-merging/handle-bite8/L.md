# Group L: where it stands

Committed: T87, 79bc4cd. Everything else is in `L.patch` (`git diff` of 22
files, the new `ui/scene/clump-layout.ts` included, taken against 79bc4cd).
It type-checks, lints, passes `type-overlap` and knip, and passes every test
but one: `flower-plots.test.ts` on a tablet, below.

## The design in the patch

- **Each clump slot's place depends on its own species only**, not on the
  pair. `game.ts` says a slot is "where a mushroom stands for its whole
  life", and a place keyed on the pair would make the back mushroom jump
  every time a different species grew in front of it.
- `MeadowLayout.mushrooms` becomes `readonly SlotPlaces[]`, where
  `SlotPlaces = Record<Species, Placement>`. Code that places a real
  mushroom calls `placeIn(slots, mushroom)`. Code that needs every foot
  (flowers, the sun's wash, the tests) calls `everyPlace(slots)`. A forest
  slot has the same place for every species (`forAll`). The compiler found
  every consumer: mushroom-bed, flower-sight, perch-sight, clump-shade,
  picker (its button now flies to the picked mushroom's own place),
  flower-plots, sun-layout, and eight test files.
- `clump-layout.ts` holds `CLUMP_ACROSS`, `CLUMP_DOWN` and `CLUMP_STEP`,
  unchanged, as the fly agaric's feet. `CLUMP_SHIFT` moves each other
  species' foot off the fly agaric's (across in clump size, down in ground
  depth), then holds it inside the screen by that species' own reach. That
  reach comes from `speciesReach` in `mushroom-pose.ts`, which is what
  `maxReach` now takes the maximum of. The clump's size is still computed
  from the fly-agaric feet under `maxReach`, so the opening clump is
  unchanged: same size, same places.
  - Landscape, back foot: porcini (-0.07, -0.07), chanterelle and russula
    (-0.08, -0.06).
  - Landscape, front foot: porcini (+0.15, 0), russula (+0.07, 0).
  - Portrait, back foot: every non-fly-agaric species (-0.05, -0.04).
  - Portrait, front foot: porcini (+0.12, 0), russula (+0.04, 0).
- Porcini genes: `stemHeight` [0.54, 0.64], `stemWidth` [0.28, 0.32],
  `capWidth` [0.86, 1], `capHeight` [0.32, 0.39]. The porcini is now a wider
  bun on a short, fat stem. A stem shorter than 0.54 leaves only 7 door
  stations, and `house.test` requires 8, so this is the shortest the door
  tests allow. The comment on the porcini's genes still needs rewording to
  match.

## Measurements

Exhaustive sweep: `tmp/handle8/L/tune.ts`, all 16 pairs × 2000 visits × all
6 screens. Worst back cap in view / worst back doorway in sight:

| | before | after |
|---|---|---|
| tabL, phoneL, desktop | chanterelle behind fly agaric 28.4% / fly agaric behind porcini 65.9% | fly agaric behind fly agaric 45.2% / 80.7% |
| tabP | chanterelle behind fly agaric 35.4% / fly agaric behind porcini 62.5% | russula behind fly agaric 48.1% / 80.7% |
| phoneP | chanterelle behind fly agaric 35.2% / 76.1% | russula behind fly agaric 47.4% / 80.7% |
| phoneS | — | fly agaric behind fly agaric 47.2% / 80.7% |

In every row, the worst pair after the fix is the opening clump's own
numbers or better.

Visible stem height ÷ cap width (median over 2000 seeds, measured to the
lowest drawn point over the stem's top):

- porcini: 0.81 before, **0.58** after
- fly agaric: 0.80, unchanged

## Tests in the patch

- **T76.** `layout.test` walks the 16 pairs in turn over the 2000 visits:
  each pair gets 125 visits. Sixteen pairs on every visit would take about
  7 minutes. `layout.test` still takes about 63 s. `worstOf(keys)` fails
  when any key goes unmeasured: pair names for the clump sweeps,
  species × slot for the edge sweep. The 125-visit sample misses the tail
  (fly agaric behind fly agaric reads 59%, against 45.2% over all 2000
  visits), so `tune.ts` is what shows the margin.
- **T86.** `mushroom-genes.test` measures the narrowest cap and gills
  through `headOutlines` over 2000 seeds, against the smallest slot on any
  screen. The cap is measured across its own frame, because a finger's
  circle fits a turned cap the same. Its horizontal width on screen shrinks
  by cos(turn) (58 px), and that is not the target a finger sees. Result:
  fly agaric 64 px, porcini 76 px, chanterelle 69 px, russula 67 px, all
  ≥ 2 × TAP_RADIUS. The duplicate finger test in `layout.test` is removed.
- **T79.** In `mushroom-genes.test`: the porcini's median visible stem must
  be ≤ 0.6 and below the fly agaric's.
- **T87** (committed). The test sweeps `capReach` against `speciesReach`
  and `maxReach`. Scaling `maxReach` by 0.8 on purpose made 2 of the 3
  sweeps fail.

## What is left

1. **`flower-plots.test`, tablet, both meadows: "median 3 planted"**, below
   `LEAST_PLANTED`. The bees' planted flowers keep clear of every place any
   species could stand (`clearOfFeet(place, everyPlace(...))`), and the
   clump's footprint has grown from 2 feet to 8. Ways out:
   - smaller shifts;
   - keep plantings off only the feet of what stands now, plus each free
     slot's places;
   - accept a lower median.

   This is the operator's call.
2. Porcini gene comment. Plan item 8's wording: "a stem about a third of
   its cap" still holds (0.32). The line "every stem stands tall enough…"
   should become "the clump stands each species' foot by its own
   (`CLUMP_SHIFT`)". The `capReach` line should read "the painter stays
   inside the layout's bound (`speciesReach`, `maxReach`)".
3. After-frames. Before-frames are in `tmp/handle8/L/before/`: tabL and
   phoneP opening, a tabL porcini and a fly agaric. None has been taken
   after the change.
