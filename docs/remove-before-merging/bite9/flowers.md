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

## Paused — state of the work

`flowers.patch` beside this note is the whole diff of the flowers' paths
(`flower-layout.ts`, `flower-plots.ts`, `flower-sight.ts`, `model/pollen.ts`
and the two tests), taken against 4d5abe3d's tree while placement's
uncommitted changes (`.place` on `ClumpShade`, `layout.mushrooms` a
`MushroomGround`, `Planted.foot`) stood in it; it type-checks only on top of
those. `layout.ts` already calls `seededBed`/`flowersOn` (placement wired it).

Done:

- `flower-layout.ts`: `FlowerFoot`, `standingOn`, `groundOf` (unproject),
  `flowersOn`, `seededBed(opening, seed)` — the bed placed once on the
  opening screen's ground, sampled as before (screen-fraction spots, the
  visit's stream), guarded on the ground by `clearOfFeet` (the opening
  clump's feet only) and `headsApart`, and on the opening screen by the
  controls and the clump's shade. The ground guards hold exactly for every
  foreshortening in `FORESHORTENING = [0.25, 0.8]` (screen px down per z
  step over the clump's px across; 0.251 small phone sideways to 0.765
  phone upright), so they hold through every camera, not one. `placeFlowers`
  (the shim) is removed; `FlowerGround.feet` is gone (unused).
- `flower-plots.ts`: ring slots on the ground (`RING_SLOTS` `{x, z}` in the
  parent's size, sides ±1.1, diagonals ±0.5 / ∓1.2, sized to stay apart at
  the flattest foreshortening), `ringFoot`, `groundFor(foot, standing,
  feet)` all on the ground, `StandingFlower` carries `foot`, plus
  `flowerFeet` and `clearOfFlowers` as agreed above.
- `flower-sight.ts`: planting reads `ringFoot`/`groundFor` on the ground and
  keeps the in-sight test on this screen only. `pollen.ts`: comments.
- `flower-layout.test.ts` rewritten and **passing** (42 tests, 9 s, was
  81 s with the plots test): same ground on all 12 screens (6 × both ways)
  per visit, all visits' beds distinct, clump-feet clearance ≥ 1.000 and
  heads ≥ 1.002 through every camera, controls and ≤ 50 % shade on the
  opening screen, shorter than the stems. Flowers per visit 7.00 on every
  screen before and after. Turned diagnostic: past the screen's side on the
  turn — tablet 4.46, phone sideways 4.22, desktop 5.09 of 7 a visit;
  portraits turned 0; under a control on any turn 0.

Left:

1. Run `flower-plots.test.ts` (rewritten, uses `opened(…, forest)` from
   `visit-play.ts` and `flowerFeet`); it ran past 600 s under the tool
   limit, so cut its sweep (`VISITS.slice(0, 60)` × 12 screens × 3
   standings is too many `meadowLayout`s — lay each screen out once per
   visit, or sweep 20 visits) and fix what fails.
2. Break a guard once on purpose (e.g. `FORESHORTENING` back to 0.3 fails on
   the small phone turned, seen already) and note it.
3. `pnpm exec eslint`, `type-overlap`, `knip` on the paths (eslint was clean
   before the last prettier pass; `depthScale` is re-exported for
   `grain.ts`).
4. Commit the six paths, probe build, play runs on tabL and phoneP into
   `tmp/bite9/flowers/`.

For the operator: a landscape visit turned to portrait crops about 4½ of
its 7 flowers off the sides — the rule "a rotation changes the crop" taken
literally. Keeping a share of the bed inside `COMMON_FRAME` would hold some
on every screen.

To finish: `git apply docs/remove-before-merging/bite9/flowers.patch` (only
if the paths were reset), then the list above.
