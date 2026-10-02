# Step 0 — the store becomes the plane (hand-over)

## Done

- **A** (2b9942c) — `model/ground.ts`: `groundOfPlane`, `anchored`,
  `unanchored`; round-trip tests in `model/ground.test.ts` ("the lens").
  Anchoring at `OPENING_EYE` is the identity bit for bit.
- **B, source half** — `step0-b.patch` beside this note (`git apply` from the
  repo root). Every non-test source type-checks with it applied; the tests
  do not yet (87 errors, all in `*.test.ts`), so it is not committed as
  source. Not run: no test has been run against it.

## Left

1. Apply `step0-b.patch`; fix the test fixtures (87 `tsc` errors): feet
   built as `{x, z}` become `planeOf(...)`/`planeFootOf(...)`; `placeOf`/
   `placeIn` take a `Footed` (`{ foot, lean }`), so a bare `{ foot }`
   fixture needs `grownOn(OPENING_EYE, ground)` or `OPENING_FOOTING[i]`;
   `extremes` returns `Footed[]`; the `grow` action carries `lean`; rules
   (`clearOfFeet`, `headsApart`, `headClear`, `groundOf`) speak
   `GroundFoot`. Files: `model/{game,ground,planting,mushroom-genes}.test.ts`,
   `ui/scene/{bed-place,clump-layout,flower-cover,flower-hold,flower-layout,
flower-plots,flower-touch,insect-drawn,insect-seat,keyed-flowers,
mushroom-tap,perch-sight,repaint-queue,tufts,view-inverse,view}.test.ts`.
2. Run every touched test file plus `layout`, `flower-layout`, `bed-place`,
   `view`, `insect-seat`, `meadow-rules`; `pnpm type-overlap`;
   `pnpm typecheck`; prettier + eslint.
3. Add the spec's check that `layout.test.ts`/`flower-layout.test.ts`'s
   seeded beds are the same feet after the round trip (within 1e-9; the
   conversion rounds at ~1e-15, so not bit for bit — see below).

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

## Outside the owned files (B needs them to type-check)

`ui/scene/flower-sight.ts` (`claimed: readonly GroundFoot[]`),
`ui/scene/clump-shade.ts` (`Opener` picks `lean`),
`ui/scene/mushroom-bed.ts` (`Shown` picks `lean`),
`ui/scene/visit-play.ts`, `ui/scene/standing-weighed.ts`,
`ui/scene/layout.ts` (bed key spells `foot.y` and `lean`).
