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

## What is wrong, in the order it shows

1. **The front is a narrow band** (`0015-clouds-3-storm-3000km`): its tail is
   a fifth of its head's width (`wide` in `stormsOver`). It wants a broad
   fibrous band.
2. **A dense fair-weather field from 2,300 km reads a little like frog-spawn**
   (`0015-clouds-3-clumps-2300km`): clumps near one scale, no streets along
   the wind.
3. **A deck has a few thin blue cracks** through to the sea
   (`0014-clouds-2-deck-2300km`).
4. **Toward the horizon from 820 km clumps go soft and blobby**, where the
   mean cover takes over.

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
front, decks), `0015-clouds-3-*` (clumps), shot with
`pnpm shoot:island --no-build --shot`; the baseline is `0000-before-*`.
