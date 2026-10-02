# Step 0 — the store becomes the plane (hand-over)

## Done

- **A** (2b9942c) — `model/ground.ts`: `groundOfPlane`, `anchored`,
  `unanchored`; round-trip tests in `model/ground.test.ts` ("the lens").
  Anchoring at `OPENING_EYE` is the identity bit for bit.
- **B** (this commit) — the store holds plane points: `FlowerFoot =
  Point & Scaled`, `Footed = { foot: Point; lean }`, the rules on
  `GroundFoot`. The test fixtures are converted mechanically (`planeOf`/
  `planeFootOf`, leans from `OPENING_FOOTING` or `grownOn(OPENING_EYE, g)`);
  no assertion changed except `game.test.ts`'s grown mushroom, which now
  also carries the `lean` the action gives it. Every touched test file plus
  `layout`, `meadow-rules`, `mushroom-room` passes; typecheck, prettier and
  eslint are clean on the touched files.

## Left

1. **`pnpm type-overlap` fails**: `FlowerFoot` (`model/ground.ts`) and
   `Footing` (`ui/scene/layout.ts`) both spell `Point & Scaled`. Naming the
   combination once (`ScaledPoint` in `geometry.ts`) trips
   `vova/no-redundant-type-alias` on both, so the only fix both gates accept
   is one name for the two: either `FlowerFoot` → `Footing` everywhere
   (11 files) or `Footing` → a shared name (8 files). That merges the plane
   foot with the screen footing, which is a naming call for the
   orchestrator, so it is not taken here.
2. The spec's seeded-bed round-trip test: `layout.test.ts`/
   `flower-layout.test.ts`'s seeded beds are the same feet after
   `groundOfPlane(planeOf(g))`, within 1e-9.

## Decided

- No transitional `Point`-typed aliases in A: B changes `FlowerFoot` to
  `Point & Scaled` in place, so an alias would only be added and removed.
- `GroundFoot = Ground & Scaled` (the old `FlowerFoot`) is the layout's
  sized foot; the rules take it, the store never holds it.
  `groundFootOf(foot)` / `planeFootOf(ground)` convert, the first memoised
  per stored foot object in a `WeakMap` (unmemoised it costs ~175 ns, and
  `groundFor`/`plantableIn` run it flowers × tufts times a frame).
- Lean: `Footed = { foot: Point; lean: Lean }`, `Lean = -1 | 1`, so
  `Planted` carries it through `Footed`. `OPENING_FOOTING` holds the pair
  with `-1, 1` (`CLUMP_SPLAY`'s signs); `grownOn(eye, ground)` gives a
  grown one `ground.x < 0 ? 1 : -1` on the eye's anchored layout, which at
  `OPENING_EYE` is today's `FOREST_SPLAY` sign exactly. The scene dispatches
  `grow` with `...grownOn(OPENING_EYE, foot)` (`arrivals.ts`,
  `visit-play.ts`); `roomFor` still returns a layout `Ground`.
- `placeOf(camera, footed)` reads the lean and `openingIndex` off the
  stored foot; `placeOnGround(camera, ground)` places a candidate `roomFor`
  tries (a forest mushroom grown there at `OPENING_EYE`).
- `ofGround`'s opening distance is `gathered(foot).y` (what
  `CLUMP_DISTANCE / scaleAt(z)` was), not `|gathered|` as spec § 3 says —
  `|gathered|` would change every zoom off the middle.
- Round trips are not bit-exact: `groundOfPlane(planeOf(g))` is within
  ~3e-15 of `g` (the opening front foot comes back at `z = -2.7e-15`). No
  comparison reads a converted value (`openingIndex`, `sameFoot` compare
  stored numbers), so nothing a person sees changes; a test asserting
  exact equality of converted feet will need a 1e-9 tolerance.

- The private placer in `clump-layout.ts` is `placedAs` (eslint's
  `no-shadow` against `standingPlaces`'s `standing` parameter).

## Outside the owned files (B needs them to type-check)

`ui/scene/flower-sight.ts` (`claimed: readonly GroundFoot[]`),
`ui/scene/clump-shade.ts` (`Opener` picks `lean`),
`ui/scene/mushroom-bed.ts` (`Shown` picks `lean`),
`ui/scene/visit-play.ts`, `ui/scene/standing-weighed.ts`,
`ui/scene/layout.ts` (bed key spells `foot.y` and `lean`).
