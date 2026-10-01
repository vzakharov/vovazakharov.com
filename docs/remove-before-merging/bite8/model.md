# Bite 8, model agent — paused

## Done and committed

- b852e8c `refactor(mushrooms): species, not caps` — item 1 in full, tree green.
  `MUSHROOM_SPECIES`, `Species`, `Mushroom.species`; the two-tone band,
  `TONE_SPLIT` and `capDark` gone; `drawCapButton` is now `drawSpeciesButton`.

## In `model.patch` (type-checks, 4 tests still red)

Apply with `git apply docs/remove-before-merging/bite8/model.patch` from the
repo root. It adds `model/mushroom-profile.ts` and
`model/chanterelle-outline.ts` and edits 16 files.

What it settles, which a successor should keep:

- **Genes** (`mushroom-genes.ts`): `MushroomGenes` is a union on `species`
  (`FlyAgaricGenes | PorciniGenes | ChanterelleGenes | RussulaGenes`). Every
  species has `spots` (empty except on the fly agaric). `GENE_RANGES[species]`
  holds the shared shape genes, drawn in one order. The chanterelle alone
  also has `lip, dip, flare, waveAmp, wavePhase` (`TRUMPET_RANGES`) plus
  `lobes` (3 to 5) and `ridges` (7 to 11). The russula alone also has `dip`
  (`RUSSULA_DIP`) and `tone` (a `RUSSULA_TONES` name). `geneBounds(name)` is
  the min and max over all species (the layout's `FINGER_SIZE` uses it).
- **Profiles** (`mushroom-profile.ts`): `stemHalfWidth` per species (club,
  cylinder, flare), `capSurface` (the cap's top), `capUnderside` (the lowest
  point of the head), and `capBase` (the lower edge of the cap's face: 0 on a
  dome, the front rim on a chanterelle). `CURVE_STEPS` and `RIM_ROUNDS` now
  live here.
- **Chanterelle parts**: `TAP_PARTS` is unchanged. `cap` is the lip, `gills`
  is the ridged funnel, and `stem` is the stem. `headOutlines(genes)` gives
  both parts in the cap frame, and `capOutlines` gives them in the mushroom
  frame. `ridgeLines(genes)` gives the ridges as model data: polylines in the
  mushroom frame that run from the rim to t = 0.55 down the stem. For a
  chanterelle, `CAP_FOLLOW` is 1 and `capTilt` is 0, so the funnel runs on
  from the stem with no joint.
- **Pose**: `capSeat` is 0.8 of the way from `capBase` to `capSurface`, which
  puts a chanterelle's seat in its dip or on its rim. `capReach` samples
  `capUnderside` and `capSurface`. `maxReach` is the max over species, and
  the ranges keep it equal to the fly agaric's.
- **House**: `windowSlots` fits panes between `capBase` and `capSurface`
  (a chanterelle's row sits on its lip). `doorStations(genes, turn)` puts the
  sill above the levelled ground (`y − x·tan turn`), and `doorInSight` passes
  the turn.
- **layout.test.ts**: `speciesOf(visitSeed)` draws each slot's species. The
  sweeps log the worst value per species through `t.diagnostic`.

## Red, and what's left

- `maxReach … as its cap is drawn`: the dome outline's underside sags 0.1 ×
  capHeight below y = 0, and `capReach` samples y = 0, so a turned drawn cap
  pokes out past `capReach`. This mismatch was there before the patch. Either
  have `capUnderside` return the sag, or sample the drawn outline.
- `doorStations` (turned, and "rises … under the gills"): not diagnosed yet.
  The likely cause is the chanterelle's or porcini's short stem, which leaves
  fewer than 8 stations.
- Not yet run: `layout.test.ts` and `mushroom-light.test.ts` under the patch.
  Collecting the per-species numbers depends on those runs. Break a sweep
  once to prove it can fail.
- Still to do: a test that each ridge lies inside the funnel and stem
  outlines, plus a visual check of every species (for example an SVG dump
  under `tmp/`). Then eslint, knip and type-overlap on the touched files.
