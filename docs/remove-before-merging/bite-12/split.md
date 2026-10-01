# split — `insect-view.ts` and `meadow-scene.ts` back under ~450

Item 2 of the plan's `## Rest of the bite`. A pure refactor: no behaviour
change. Both steps done.

## `insect-view.ts` 481 → 349 (fff4e84)

- `insect-away.ts` (new): where an insect away stands — `offScreen`,
  `pastEnd`, `entry`, `awayDown` (with `AWAY_BAND`), `drawnAt` (the old
  private `screenOf`), and `toUnits`/`fromUnits` (the old `units`/`placed`).
  Pure functions over a `Stage` (`Sized & Pick<Camera, 'world' | 'unit'>`,
  replacing the class's four `width`/`height`/`world`/`unit` fields), a
  `Seen` (the stage plus the current view) and an `Away` (`Spanned` plus
  `drop`: the wingspan at its size now, and the height its phase picks).
- `insect-shown.ts` (new): the `Shown` type and `freshShown`, the state a
  just-shown insect starts in.
- `Spanned = { span: number }` is the base `Shown` and `Away` share; the
  away members are `span`/`drop` rather than `reach`/`down` because those
  keys already mean other things (`draw-insect.ts` `Reaching.reach`,
  `skyline.ts` `HillBand.down`) and `pnpm type-overlap` would pair them.
- `Perched` and `PerchAt` stay in `insect-view.ts`, so no importer changed.

## `meadow-scene.ts` 451 → 408

- `arrivals.ts` (new): `Arrivals`, the mushrooms `+` grows and the insects
  their buttons release — the two seeded streams (same xor constants), the
  upcoming seed, `keptRoom`, and the `grow`/`roomy`/`release` handlers the
  scene spreads into `Controls` the way it spreads `Planter`'s.
- `perches.ts` (new): `Perches`, the perches as the screen stands — the
  `sight`, the open-air spots, `see(stand)` (returns `footRows` for the
  insects), `at` (the old `perchAt`) and `tapThrough`.
- `planter.ts`: `Scened` is exported, so `Arrivals`' deps extend it; the
  scene builds one `scened` object both take.
- `Perches` is built in the scene's constructor, not a field initializer:
  as a field, `unicorn/consistent-function-scoping` misreads the `this` in
  its arrow as outer-scope.

## Noted

- `pnpm type-overlap` is red at HEAD on groups none of which this package
  added; one touches a moved type: `Shown.bob` (now in `insect-shown.ts`)
  against `walking.ts` `Stepped.bob`, there before the split.
