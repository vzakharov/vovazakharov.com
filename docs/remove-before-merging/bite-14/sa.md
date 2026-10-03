# SA — step (a), the spores' model

Built `map-spores.md` § 5 (a) with calls 30–35, 38–40. Done; the shed stays
as a shim for (d).

## Done

- `model/sprouting.ts`: `SPORE_SEATS` 6, `SPROUT_WINDOW_MS` 6000,
  `SPORE_DWELL_MS` 2000, `SPORE_SALT` (= `SHED_SALT`'s value), `MOMENT_SALT`;
  types `Placed`, `Spore`, `Spored`, `SporeTap`; `sowable`, `sown`, `unsown`,
  `sproutMoment`, `sproutedInRain`. `sprouted` (shim) passes `spores` to the
  counts.
- `model/game.ts` (443 → 398): `Planted = Placed & Housed & Sprouting`,
  `Meadow … & Shed & Spored`, `select` carries `SporeTap` and spreads
  `sown(meadow, action)`, new `unsow` action, `tick` wraps in
  `sproutedInRain`. The furnishing helpers moved to `model/furnishing.ts`
  first (the import block alone took the +7 grant); `controls.ts` and
  `game.test.ts` import `canFurnish` from there.
- `model/crowding.ts`: `Stand` is `{ mushrooms, spores }`; `isFull` and
  `isCrowdedAt` count both.
- `model/weather.ts`: `darkAt(rain)`.
- `ui/scene/flower-sight.ts`: `STOOD` gains `spores`.
  `ui/scene/mushroom-room.ts`: `roomFor`'s `feet` takes spores' feet.
  `ui/scene/flower-plots.ts`: `plotted` takes `Omit<Stand, 'spores'>` (the
  map missed `standingFlowers`' call; flowers read no spores).
  `flower-plots.test.ts`: `spores: []` in its stand literal.
- Tests: `sprouting.test.ts` gains sowing, picking up, sprouting in the rain.

## Decisions the map did not take

- **The counter is `scattered`, not `settled`**: `settled: number` collides
  with `motion.ts`'s `Lit.settled` under `pnpm type-overlap`, and means
  something else there.
- **Call 40 in `sproutMoment`**: `max(drawn, at + SPORE_DWELL_MS)`, and the
  map's `m < rain.stopsAt` becomes `spore.at < rain.stopsAt` — a spore sown
  in the last 2 s of a shower comes up up to 2 s after the stop, rather than
  waiting for the next (which call 40 beats). A spore sown after the stop
  waits for the next shower. Map § 7.1's "waits for the next shower" is
  superseded by call 40.

## For step (b), the scene

- Before the search: `sowable(meadow, id, now)` → `{ seed } | undefined`
  (`now` in ms on the insects' clock, as `Timed.now`). Then
  `roomFor(stand, seed, view, parent.foot)`.
- Dispatch: `{ kind: 'select', id, spore: { foot, lean, now } }` — `spore`
  optional (`SporeTap`); without it the tap selects as before.
- Pick-up: `{ kind: 'unsow', id: <spore id> }`; changes no selection or
  picker; the same meadow for an unknown id.
- `Meadow.spores: readonly Spore[]` — each `{ id: 'spore-N', seed, species,
foot, lean, parent, at }`; reconcile dots by `id`. A spore sprouts as a
  `Planted` whose `sprout.at` is its moment − `SPORE_FALL_MS`, so it shows
  at `SPROUT_START` the instant the spore leaves the list.
- `sproutMoment(spore, rain)` and `darkAt(rain)` are exported for the play
  (c): stepping to `darkAt(rain) + SPROUT_WINDOW_MS` sprouts every spore
  settled before the rain.
