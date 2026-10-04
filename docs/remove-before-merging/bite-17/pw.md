# Bite 17 — package `pw`: window glow and stars as textures

Done: `perf.md` items 2 and 4 (window glow, stars), one step, numbers in `perf.md`.

- `window-glow.ts` `WindowGlow`: a canvas texture per house (`window-glow-<n>`), repainted
  only when `HouseView.relit` sees the lit windows change, at `zoom × camera zoom` texels a
  house unit; shown as an `Image` following the house; texture destroyed in `destroy`.
- `star-images.ts` `starImages`: one shared `dusk-star` canvas texture, rebaked on each
  backdrop paint at the widest star × ratio; each star an `Image` scaled to its radius.
  `starTexels` (sizes) lives in `dusk-stars.ts` with a test.

Left: `glowBox` has no unit test (its module loads Phaser, which Node cannot); it was
checked by eye against a base build. Frames: `frames/bite-17/pw-tabL.png`.
