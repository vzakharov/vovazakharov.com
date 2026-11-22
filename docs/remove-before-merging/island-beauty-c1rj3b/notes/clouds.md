# Clouds — hand-over note

Branch `claude/island-beauty-clouds`. Package: the clouds of `/island` as seen
from above. The march (`ui/cloud-nodes.ts`, `ui/cloud-rays.ts`) and with it
the ground and in-cloud views belong to `claude/island-beauty-clouds-march`
since 28c1f497. Everything here was shot on WebGL2 under software raster, so
no frame time below is a GPU's.

## Where it stands

**From above it is weather with real structure; from the ground it is the
march branch's to cure.**

- **The map.** `ui/cloud-regimes.ts` is read once per ray: fair-weather
  cumulus on the storm track, cyclones with a front, a cold sector of open
  cells and an ice shield, trade cumulus, decks of closed cells breaking into
  open ones, cloud streets, ITCZ clusters under anvils, clear subtropics.
- **The cells.** `ui/cloud-noise.ts` scatters one point to a lattice cell.
  `edgeOf` is the distance to a packed cell's edge (decks' veins, open cells'
  rings). `puffs` is the union of a disc round every point, each its own
  radius: the coarsest cumulus scale (9 km) and the clumps a field gathers
  into (52 km, bent by one read of noise) are both `puffs`. Finer cumulus
  scales are value noise, each on turned axes of its own (`turnedTo`).
- **No lattice may show.** A value-noise octave thresholded alone draws
  squares (cumulus from 820 km) or a chequerboard (clumps from 2,300 km);
  both were cured by `puffs`. A new field takes `puffs` or `edgeOf`, never a
  single value-noise octave.
- **Far fields.** Every scale fades before it nears a pixel's width
  (`toldFrom`), and a field of heaps too far to tell is its mean cover
  (`FAR_SOFT`, `FAR_MEAN` in `ui/cloud-cover.ts`).
- **A lay's weight mixes every row**, density and ceiling included, so a
  regime that must feather in keeps its weight whole before its cloud begins
  and feathers by its own amount and density (the front does).
- **One drift is kept.** The whole field turns east rigidly on the clock; the
  cyclones live and die on a second clock that wraps with it
  (`lib/clouds.ts`, pinned by `lib/clouds.test.ts`).
- **Every hash is the world's**: `latticeValue` and `worldCell` from
  `ui/lattice-value.ts`.

## Left

Nothing below is started. Each item names what to try first.

1. **Clumps near one scale from 2,300 km: frog-spawn**
   (`0015-clouds-3-clumps-2300km`). The clumps are one `puffs` read at 52 km,
   so their sizes span one decade of radius at most (`PUFF_RADII`). First: a
   second `puffs` read three to four times coarser that gates the first
   (clumps gather into fields with wide clear lanes), paid for only where
   `lumps` is read.
2. **Heaps too round** (`0015-clouds-3-clumps-820km`). The coarsest cumulus
   scale is a union of discs, and only the clumps are bent. First: bend
   `about` in `wave` for index 0 by the scale-1 noise already read there, the
   way `CLUMP_BEND` bends a clump, so it costs no read.
3. **No streets along the wind in a fair-weather field.** A streets weight in
   the fair-weather lay only thickened the field, because `streets` adds a
   ridge to the amount. First: stretch the clumps' own coordinates along the
   regime's `bend` before `puffs`, so the heaps line up rather than a line
   being laid over them.
4. **The front is still narrow** (`0016-clouds-4-front-3000km`): after
   `FRONT_NARROWEST` the tail is 0.45 of the head, a band and no longer a
   thread, but not the broad fibrous shield of a real front. First: widen
   `WARM_FEATHER` and give the warm side its own high ice sheet through
   `ui/cloud-ice.ts`, which is what reads as breadth from orbit.
5. **Thin blue cracks in a deck.** A vein takes `VEIN_WEIGHT` from the amount
   down to clear sea. First: floor the vein's cut so a deck's amount stays
   over zero under it (thin cloud, not none), and let only the open-cell
   regime clear.
6. **Toward the horizon from 820 km clumps go soft and blobby**, where the
   mean cover takes over (`FAR_SOFT`, `FAR_MEAN`).
7. **The view from the ground** is the march branch's. From 22 m over the
   dunes, on WebGPU, the sky is flat grey overcast with long smeared streaks
   along the horizon, and no cloud has a shape. The cause is not settled; two
   candidates, one on each side of the seam. In the field: `toldFrom`
   measures a wave against its distance alone, so near the horizon, where a
   heap is seen edge-on and foreshortened many times over, scales still count
   as told that span under a pixel in height. In the march: four steps and
   one sheet read at the layer's entry over a grazing path hundreds of
   kilometres long draw the top as a straight run between far-apart ends,
   which is a streak. Settling it takes one frame from 22 m with `STEPS`
   raised to 16: if the streaks go, it is the march.
8. **Two economies, not done**, both in the march's file: `STEPS` 3 for an
   eye over `HIGHEST_TOP`, and one `mesoAt` read at the layer's middle from
   orbit in place of one at each end.

`/dry` and `/tend-prose` were not run over this branch.

## Cost

Counted in value-noise reads per cloudy ray, the baseline being 19: the map
4, the cyclones about 3, the meso field at the layer's two ends 2–9 (clumps 2
reads, packed cells 3 with their warp), four field samples of 2–5 octaves
each, the sunward read 4 from over the layer, the sheet of fine scales up to
5 where a step hides them, streets 5 where there are any. About 25–40, so
1.3–2× the baseline against a budget of 1.5×; it needs measuring on the M2.
The economies left are in the march's file: three steps for an eye over the
layer, and the meso field read once in place of at both ends.

## Outside my files

- No land–sea mask is asked for.
- `pnpm knip` fails on `detailReach` in `src/island/entities/terrain/`.

## Frames

`frames/0010-clouds-1-*` (step 1), `0014-clouds-2-*` (lattice, open cells,
front, decks), `0015-clouds-3-*` (clumps), `0016-clouds-4-*` (the front's
tail), shot with `pnpm shoot:island --no-build --shot`; the baseline is
`0000-before-*`.

`0014-clouds-2-deck-2300km` and `0014-clouds-2-deck-300km` show no deck: the
weather is rolled per world, and the roll they were shot under has open sea
at 28, -43. A deck frame wants a spot found afresh in the regime map.
