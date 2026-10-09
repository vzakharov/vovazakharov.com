# The mushroom meadow

**Vet skips this slice's tests; a branch that changes the game runs them.**
They simulate the game across every screen it fits and take over half an hour,
so `scripts/vet-test.sh` leaves them out unless asked — and nothing else asks.
Run `VET_MEADOW=1 ./scripts/vet.sh` at a milestone, `/finalize` included, or
`pnpm test:meadow` alone; a change to anything those tests import from outside
the slice (`src/shared/`, `package.json`) counts as changing the game.
