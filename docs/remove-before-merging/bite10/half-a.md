# Bite 10, half A — what the agents decided

For folding into the plan's `## Eaten so far` at the bite's end.

## Insect sizes (fe648aa) — the floors won, the shrink gave way

`insectSizeFor` (`layout.ts`) is `max(INSECT_LEAST, INSECT_SCALE × unit)` on
every screen and refit; the rule that a butterfly is never wider than the
clump's narrowest cap is gone. After a turn the refit zooms a grown phoneL
meadow out to unit ~37, where the cap rule drew butterflies ~25 px and bees
~15 px — specks to a six-year-old. A floor under the shrink set at the least
spans was tried and bought nothing. `LEAST_SPANS` (52/30/30) lives in
`layout.ts`, asserted over 2000 seeds on every screen, and the play run
imports it. Accepted cost: on a grown phone meadow turned upright, about one
flower in six or seven by an edge or control loses a butterfly's wing room;
no flower disappears, butterflies just don't perch there. The turn test asks
80% of flowers kept in sight, not all.

## Spore rings (b686064)

Each puff is a container tied to its mushroom, following its position and
size every frame, so a refit carries it. `puffFrom` is shared by the tap and
house puffs.

## Mushroom tap patches (c338f86, cfd46f3, 7ea4b39)

The play run's "unreachable" caps were a probe defect: a resting butterfly
covered the cap's visible part, and the game passes an insect tap to the cap
under it. The sweep (`mushroom-patch.test.ts`, 40 visits × every forest size ×
every `VIEWPORTS` screen) then found two real losses, fixed by hit-testing,
layout untouched:

- a flower's tap circle (≥ `TAP_RADIUS`) took taps on a far cap's drawn body;
  past its petals a flower now answers only where no mushroom is drawn;
- a head shallower than `TAP_RADIUS` now gets a finger pad as a narrow one
  does.

The patch floor is 24 px across, not a finger's 64: placement lets nearer
mushrooms hide 25% of a cap (`MOST_HIDDEN`), so 64 cannot hold without
spacing the forest wider, which looks worse. The species step now taps all
six of a grown forest.
