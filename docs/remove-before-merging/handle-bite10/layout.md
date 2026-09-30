# Layout group — hand-over

Done: T118 06d0b5f, T119 e8861a3, T114 3db04d5 + 76bfb88 (plan line), frames 03846d9.

## Left: T115 (the mushroom patch)

Not started in source. The test (`mushroom-patch.test.ts`) is unchanged.

Reproduced. The review's three seeds are `VISITS` indices 127, 1251 and 1061,
and each has no 24 px patch on a full forest. The sweep is
`tmp/handle-bite10/layout/patch-sweep.ts <screens> <from> <count> full`: it
copies the test's hit-testing and adds a 44 px count.

What takes the taps off the missing mushroom:

- 1005716 mushroom-4, phoneL: flowers in front of the cap. With no flowers
  it has a patch.
- 9906672 mushroom-3, phone: mushroom-2's tap area together with a flower.
  It still has no patch when either the flowers or the controls are removed.
- 8402062 mushroom-1, phoneS: mushroom-2, mushroom-3 and a flower.

All three have a patch when they stand alone. Nothing in growth checks for a
patch; the patch only follows from `MOST_HIDDEN` and `FLOWER_APART` in
`mushroom-room.ts`.

The fix I would make: move `targetsOf`, `takerAt` and `patchOf` from the test
into a production module. `roomFor` then admits a foot only where the new
mushroom, and every mushroom it stands in front of, keeps a
`LEAST_PATCH`-radius patch among the mushrooms and the standing flowers. The
check runs last, because it is the most expensive. After that, try raising
`LEAST_PATCH` toward 16–22, holding `LEAST_FULL` (0.99) in `layout.test.ts`.

The test then runs every full forest in `VISITS` (about 30 s per screen
measured) as well as the first 40 at every size. It bounds the share under
44 px per screen; the review measured phone 24%, phoneS 37%, phoneL 23% and
tablet 28%.

Caveat: `tapTarget` is being moved from `visit-play.ts` to `mushroom-tap.ts`
by another group, uncommitted at the time of writing, and `visit-play`
re-exports it.

## Not fixed: tabL flowers bunching (T118, third ask)

The child's plantings bunch because of where the tufts stand and how far
apart the heads are held (`growTufts` in `tufts.ts`, `headsApart`). That code
belongs to the tufts group and is being rewritten now.
