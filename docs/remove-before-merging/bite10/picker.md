# Bite 10, half B — the child plants flowers (group `picker`)

## Done

- Model (step 1): `Meadow.planting` (the tuft's ground foot, then the chosen
  colour and one seed per shape), actions `tuft` / `colour` / `plant`; a
  child's flower is a `RootedFlower` (own ground foot) in `meadow.planted`
  beside the bees' `BeeSown`, so `FLOWER_LIMIT` and ids cover both.
  `shapeSeeds` draws the four seeds before the shape stage, so the picker can
  show the very flower that grows. Tests: `model/planting.test.ts`.

## Left

- Tufts: hit test (`tuftAt`), whether a tuft takes a flower, refusal (nuh-uh
  and the tuft shakes).
- Picker UI: colour row on the house picker's five slots, shape row on the
  species picker's four; pictograms; scene wiring; layout test.
- Play-run step `scripts/lib/play-tufts.ts`, frames.

## Decisions

- A tap on a tuft while the flower picker is open closes it (the plan's "a
  tap outside an open picker closes it"), rather than moving it to the new
  tuft.
