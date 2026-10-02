# Step 0 — the store becomes the plane (hand-over)

## Done

- **A** — `model/ground.ts`: `groundOfPlane(point: Point): Ground`
  (`planeOf`'s inverse), `anchored(eye: Eye, point: Point): Point`,
  `unanchored(eye: Eye, point: Point): Point`; round-trip tests in
  `model/ground.test.ts` ("the lens"). Anchoring at `OPENING_EYE` is the
  identity bit for bit.

## Left

- **B** — stored feet as plane `Point`s, readers converting at entry,
  `lean` on `Planted`.

## Decided

- No transitional `Point`-typed aliases in A: B renames `FlowerFoot` to
  `Point & Scaled` in place, so an alias would only be added and removed.
