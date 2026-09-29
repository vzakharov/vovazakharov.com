# Bite 9, flowers group — what the placement agent builds to

## The flowers' feet (the agreed name)

`ui/scene/flower-plots.ts`:

```ts
/** Every flower standing in `stand`, seeded and planted, as its foot on the ground. */
export function flowerFeet(stand: Stand): FlowerFoot[];

/** Whether a mushroom's foot `foot`, of `size` in the clump's, keeps off every flower of `flowers`. */
export function clearOfFlowers(foot: FlowerFoot, flowers: readonly FlowerFoot[]): boolean;
```

`FlowerFoot = Ground & Scaled` (`model/ground.ts` `Ground`, `model/geometry.ts`
`Scaled`): `{ x, z }` in the clump's units, `size` a flower's height (or a
mushroom's size) in the clump's size, before depth scales it. `Stand` is
`flower-sight.ts`'s (`layout`, `flowers`, `planted`, `mushrooms`).

`clearOfFlowers` is the same rule `clearOfFeet` holds a flower to, turned
round: a mushroom's foot `FOOT_CLEARANCE × size` plus the flower's head off
the flower's stem, on every screen the ground is foreshortened for
(`FORESHORTENING`), so a pick that passes it stays off the flower on every
screen. The reducer is model code and cannot call this: pass the feet in on
the `grow` action (as `sight` rides on `release`/`tick`), or pass the
predicate's inputs, whichever you prefer.

If `model/` needs `Ground & Scaled` by name too, move it to `ground.ts` as
`Foot` and I point `FlowerFoot` at it (type-overlap floor 2).

## A change in `layout.ts` (yours) the flowers need

The seeded bed is placed once a visit on the opening screen's ground and
projected through the current camera (`flower-layout.ts`):

```ts
export function seededBed(opening: FlowerGround, seed: number): FlowerFoot[];
export function flowersOn(camera: Camera, bed: readonly FlowerFoot[]): Footing[];
```

Until `meadowLayout` calls these, `placeFlowers(here, turned, seed)` stays as
a shim over them (exact on the opening screen and its turn, proportional on a
resize as today). Replace the flower part of `meadowLayout` with:

```ts
const here = stoodMeadow(width, height); // or standMeadow, now that no turn is placed
const opened = groundOf(screen.width, screen.height); // FlowerGround of the opening screen
return {
  ...here.layout,
  flowers: flowersOn(here.layout.camera, keptBed(opened, seed, openers)),
};
```

— `keptBed` being `placedOn` without the turned screen (a cache of
`seededBed` by screen, seed and openers) — and drop `turned`, the
`from`/`to` mapping and the swapped-key lookup. Then `placeFlowers` goes.
