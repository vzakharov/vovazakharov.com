# split — `insect-view.ts` and `meadow-scene.ts` back under ~450

Item 2 of the plan's `## Rest of the bite`. A pure refactor: no behaviour
change.

## Done

- **`insect-view.ts` 481 → 349**, along two seams:
  - `insect-away.ts` (new): where an insect away stands — `offScreen`,
    `pastEnd`, `entry`, `awayDown` (with `AWAY_BAND`), `drawnAt` (the old
    private `screenOf`), and `toUnits`/`fromUnits` (the old `units`/`placed`).
    Pure functions over a `Stage` (`Sized & Pick<Camera, 'world' | 'unit'>`,
    replacing the class's four `width`/`height`/`world`/`unit` fields), a
    `Seen` (the stage plus the current view) and an `Away` (`Spanned &
{ drop }`: wingspan at its size now, and the height its phase picks).
  - `insect-shown.ts` (new): the `Shown` type and `freshShown`, the state a
    just-shown insect starts in.
  - `Spanned = { span: number }` is the base `Shown` and `Away` share; the
    away members are `span`/`drop` rather than `reach`/`down` because those
    keys already mean other things (`draw-insect.ts` `Reaching.reach`,
    `skyline.ts` `HillBand.down`) and `pnpm type-overlap` would pair them.
  - No import elsewhere changed: `Perched` and `PerchAt` stay in
    `insect-view.ts`.

## Left

- `meadow-scene.ts` (451).

## Noted

- `pnpm type-overlap` is red at HEAD on six groups, none from this package;
  one touches a moved type: `Shown.bob` (now in `insect-shown.ts`) against
  `walking.ts` `Stepped.bob`, already there before the split.
