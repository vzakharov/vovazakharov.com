# Perch group — done

This note covers T50, T52, T53 (the air half), T59 (the test half), the
catchability call, and the two nits. The rules are in
`tmp/handle-bite6/common.md`.

## Done

- **52295ea**: crowding by kind, `keptForBees`, the flies' pull and
  fussiness, the denser and lower air grid, hovering air legs, `stride` and
  `Sight.places`, the two nits. Perch crowding measures each seat's track.
- **8321601**: T52. A seated butterfly or fly gives way to a bee waiting in
  the air (`givesWay`); a hovering bee flies on once a flower opens
  (`flowerFreed`). The perch rules live in `model/perch-room.ts`.
- **c825c19**: `ui/scene/fliers.test.ts` and `visit-play.ts`, swept over
  every `VIEWPORTS` screen. The air seats every insect the meadow can hold
  apart. All ten fliers never leave, never crowd a perch, and never hold air
  spots whose wings overlap. Bees roam under 25%. Flies land on spotted caps
  at least 60% of the time, over ten visits. Every kind is caught at least
  70% of the time. On base 643bdb6, every describe except the catch sweep
  fails on some screen. The catch sweep cannot be judged on base, because
  base's `Sight` has no `places`.
- **8a3aebe**: bees see flowers from their own seat. A bee sits below the
  lower rim and spans less than a butterfly, so `perchSight` reads each
  flower for a bee too (`beeFlowers`, `flowersFor`). Small phone bees roam
  13.4% of the time (was 42.3%), and three bees alone 11.5% (was 28.7%).
  Where the usual air grid cannot seat everyone apart, it is halved
  (`seatsEveryOne`). Only the small phone takes the halved grid.
- **c7a61f6**: the play run. It waits until the longest stretched flight in
  has landed, taps only flies drawn on screen, and checks the growth of the
  flower it saw planted. All five screens play through.

The mushrooms suite passes at 8a3aebe: 417 tests, 2 of them todo.

## Unmet

**Small phone, all ten with the opening clump: two fliers hold overlapping
air spots on 33% of ticks** over the test's three visits, 24% over ten (was
68%; measured at 4550cd0). Even the halved grid seats only eight of the ten
apart. A greedy pass needs a grid of about a twentieth of a
wingspan (4313 spots) to seat all ten, which `perchSight` cannot afford. The
air test and both all-ten air tests run as `todo` on the small phone
(`AIR_UNMET`): with a full forest two fliers still overlap on 0.28% of ticks
over three visits, 0.21% over ten.

## For a person looking at the screen

- A butterfly that gives way leaves a flower moments after landing. Check
  that this reads as making way rather than as a twitch.
- Stride makes flights in from off screen slow. A fly can take about 11 s
  to cross into a phone, and a butterfly about 9 s to cross a tablet.
- On a small phone, bees now sit on flowers that butterflies do not. Those
  flowers sit lower or nearer the controls.

The harness is under `tmp/handle-bite6/perch/`. Run each script with
`pnpm exec tsx`. `roam.ts` takes `W`, `H` and `ALONE`, `pack.ts` and
`steps2.ts` probe the air grid's packing, and `time-sight.ts` times
`perchSight`.
