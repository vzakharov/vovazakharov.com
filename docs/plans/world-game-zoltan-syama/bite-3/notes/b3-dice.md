# b3-dice — the island rolls on `@/dice/shared/roll`

Branch `wt/b3-dice`, base `1a87e1c2` (`origin/island/round-world`, past
`797d8a79`). Done; not merged into `island/round-world`.

## What moved

- `src/masd.json`: `island` takes `["scene", "dice"]`; `dice` moved above it,
  since a parent is declared above its child.
- `eslint/masd-graph.ts`: `dice`'s `WAITING_APPS` entry removed — island was the
  second child it waited for.
- `world-schema.ts`, `sphere-world.ts`, their tests, `sphere-series.test.ts`,
  `pages/island/lib/place-hash.ts` and `scripts/lib/play-tab.ts` import from
  `@/dice/shared/roll`.
- `OUR_WORLD` stays in island, alone in `world/land/model/our-world.ts`.

## Deleted, and why

- `world/roll/` whole (`roll.ts`, `decode.ts`, both barrels, three tests):
  `decode.ts` and `decode.test.ts` are byte-identical to dice's; dice's
  `roll.test.ts` opens with the island's 32 lines unchanged, then adds `over`,
  `wide` and `pick`.
- `world/land/model/hash.ts` and `hash.test.ts`: dice's differ only by
  `OUR_WORLD` and one doc phrase; the tests are byte-identical, so the
  `worldHash`, `murmur3` and `assertWorldNumber` pins live on in dice.

## Where dice's public API is narrower than the island's copy

Dice's barrel exports
`isWorldNumber, pathHash, roll, Rolled, rollWith, sealWith`; it has no
`index.test-only.ts`. The island needed four things it lacks, each met without
touching `src/dice/`:

- `TableIndex<Harmonic>`: `harmonicIndex` lost its return annotation, its
  callbacks' parameters typed instead; `roll.table` checks the shape.
- `WordSource`: `BuildOptions.source` is `Parameters<typeof rollWith>[1]`.
- `assertWorldNumber` (only `play-tab.ts`): an `isWorldNumber` check throwing
  the same message.
- Tests' `decodeNormal` and `Roll`: decoded through
  `rollWith(roll.struct({ z: roll.normal() }), …)`, and
  `Parameters<typeof rollWith>[0]`.

## The pin

`src/island/entities/terrain/world-pin.test.ts`, committed before the switch and
unchanged by it. Per world #0–#7: the raw word `H(N, "noise/seed")`, the decoded
words at `land/sea` and `land/harmonic/2/-1`, and `heightAtSphere` at 10° N on
the +X meridian of `openSphereWorld(N)`, all exact. Values computed by a scratch
driver on the island's own hash/roll at `1a87e1c2`.

`worldHash` is not in dice's public API, so the committed pin cannot import it
after the switch; the same driver, rerun against dice's `hash.ts` after it,
printed identical `worldHash(N)` words at `0, 1, 2^32−1` and `pathHash(N)` at
`""`, `land/sea` for every world, besides the pinned fields. Sample, world #1:
`worldHash` `2219631963, 3381716939, 1348057165`; `pathHash`
`3295674060, 3183559979`.

## Checks

622 island and cube-world tests green; tsc, eslint on touched files,
`check:masd`, `check:cycles`, `masd:clusters` clean. `type-overlap` fails on two
groups the base also has (island's `BuildTimes` against cube's `Outside` and
`Scuff`, through `vova`); the switch removes the base's other six, the island's
`roll.ts` duplicating dice's types. `knip`'s findings name no symbol this change
touched.
