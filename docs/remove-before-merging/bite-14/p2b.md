# Bite 14 — P2b hand-over: sprouting's scene, the rest

## Done

- `ui/scene/mushroom-shown.ts`: `Shown` keeps `Pick<Planted, 'foot' |
'lean' | 'sprout'>` (`SHOWN_OF`, so it and `Planted` share no hand-spelled
  base); `plantedAt` is the spores' landing, `(sprout.at + SPORE_FALL_MS) /
1000`, for a sprout.
- `ui/scene/mushroom-bed.ts` (427 → 429): `update` multiplies
  `sproutScale(sprout, t * 1000)` into `grown` and hides body and shadow
  while it is 0; `reconcile` hands every newborn to `driftSpores`;
  `inSight(id)` is `footShown`; `tap`'s crown is `crownOf`.
- `ui/scene/spore-drift.ts` (call 19): `driftSpores(scene, voice, born,
shown, depth)` — a newborn without `sprout` puffs and plays grow where it
  stands (the bed's old branch, moved here); per parent, a puff from its
  crown and `DOTS` 4 spore dots per sprout on staggered arcs crown → foot
  over `SPORE_FALL_MS`, both ends read every frame, then a small puff and
  grow at the foot. `crownOf(genes)` is shared with the bed's `tap`.
- `ui/scene/spores.ts`: `drawnAt(body, point)` out of `puffFrom`, used by
  the drift too.
- `ui/scene/meadow-scene.ts` (446 → 448): the tick carries
  `shed: shedNow(scened, bed, time)`.

## Decided here

- The newborn puff + grow moved out of the bed into `driftSpores`, so the
  bed's reconcile has one call for both kinds of newborn and the bed stays
  at +2 lines rather than ~+15.
- `driftSpores` takes the bed's `shown` map rather than a lookup closure
  (shorter call, same contract).
