# Bite 11 — package "grass" hand-over

Plan § "Rest of the bite", item 11, package 3 step 4.

## Done

- `seamGrass` (`ui/scene/grass.ts`) scatters the seam's tufts over the ground
  layer's span, `layerSpan(camera, PARALLAX.ground)` — the world, `0..world`,
  the same stretch `groundSeam` runs — at the same 28 per 1000 px, so the
  right end's horizon is no longer bare. No call-site change: the layout
  already carries the camera.
- `ground-seam.test.ts`: every tuft lies inside the world, and the crops at
  the left end, the middle and the right end each hold at least a quarter of
  a crop's share of tufts (every viewport, 20 visits). `grain.test.ts`,
  `tufts.test.ts`, `backdrop-tones.test.ts` green.

## Decided

- The seam grass is a per-frame `Graphics` in world coordinates, not a bake,
  so the ≤2048-column tiling does not apply to it.
- The tufts stay uniformly random across (not stratified): a crop's count
  varies as it did on one screen (a phone's left-end crop held 5 of ~11 for
  one seed), hence the test's quarter bound rather than a half.

## Left

- Not looked at rendered (no screenshots taken).
