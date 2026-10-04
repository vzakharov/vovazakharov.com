# Bite 17 — package `pm`: the moon and the clouds at dusk

## Done

- The moon is baked once per paint (`moon-view.ts`, `MoonView`): `drawMoon`
  into a supersampled scratch, shrunk into `whole` at a texel to a device
  pixel, shown in `face` (a `RenderTexture` at `glowDepth`, faded by
  `moonUp`, placed on whole device pixels round `moonAt`). `paint-moon.ts`
  gains `moonReach` for the picture's size. The tap (`sunAt`/`onTheSun`) is
  untouched.
- Clouds in front of the moon are erased from `face` (`cloudsOver` in
  `dusk-view.ts`, `cloudOverMoon` as before), redrawn only when a cut moves by
  a device pixel or stretches (a tapped cloud's wobble). No filters on the moon.
- The day clouds go to alpha 0 at full dusk (`relight`), under their opaque
  twins; the cut's source is the twin then, the day cloud before.
- Numbers in `perf.md` item 5: full dusk 36 → 33 draws, 123k → 94k vertices,
  5 → 0 framebuffer binds (2 on a recut frame).

## Decided

- Erase over masks or depth: depth would put the clouds over the wash too
  (unwashed, and over the fliers in front of them); a moon-sized filter mask
  could not follow screen-fixed clouds through an auto-focused filter camera.
- Day clouds hidden by alpha, not `visible`, which the rain view and the probe
  read as "on the screen".

## Left

Nothing in this package.
