# S1 — settled at rest (hand-over)

Done, one step: the pure settling.

- `model/kept-record.ts` — types only: `KeptMeadow = Omit<Meadow, 'selected' |
'picking' | 'furnishing' | 'planting' | 'rain'>`, a private
  `Stance = Eyed & WithGait`, `Kept = Seeded & Stance & { version: 1; meadow:
KeptMeadow }`. S2 adds `KEPT_VERSION`, `KeptSchema`, `readKept` here.
- `model/keeping.ts` — `RESTED_AT = -SPROUT_MS`, `settled(meadow, now):
KeptMeadow`, `reopened(kept: KeptMeadow): Meadow`.
- `model/flier-rest.ts` — `restedFliers(insects, now): readonly Flier[]`.
- Tests beside both, on visits played through `opened`/`play`/`reduce`.

Decided here:

- "Settling twice equals settling once" is tested as
  `settled(reopened(settled(m, now)), 0)` deep-equal to `settled(m, now)`:
  a kept stay is counted from the next load's start, so the second settling
  is at that load's 0.
- `Stance` exists because `Seeded & Eyed` is already spelled by
  `MapSnapshot` (type-overlap's combination floor); S3's `openingWalk` start
  can take it (export it then).
- `UNKEPT` in `keeping.ts` repeats `game.ts`'s private `PICKERS_SHUT`
  values (game.ts is off limits to S1).
- `keeping.ts` and `flier-rest.ts` import each other (`RESTED_AT` one way,
  `restedFliers` the other); both uses are inside functions.

Left: nothing for S1.
