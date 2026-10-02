# Package tail-probe — hand-over note

Steps 2 and 3 of `tail-screens.md`.

## Done

- **Step 2, the sliced re-tend timed:** the probe wraps `Grass.retend` (the
  gather) and `Grass.tendOn` (each 60-tuft slice) beside `Grass.tend`, all
  into `__probe.hitches().tend` (`scripts/lib/mushroom-probe.ts`), so the
  approach play's "frames carrying one" count slice frames as lawn frames;
  its note now names them "the lawn's tending calls (whole re-tends,
  gathers, slices)" (`scripts/lib/play-approach.ts`). No game-side change:
  the private methods are plain instance-reachable methods, and `follow`'s
  `this.` calls reach the instance's wrapper first. Neither file has a unit
  test.

## Left

- Step 3: one tabL `veer` play.
