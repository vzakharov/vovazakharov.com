# R6b — the coastline in the shader

## Done

1. Sea material (`ui/ground-lighting.ts`, `seaSurface`): `transparent`, water
   thickness along the ray from `viewportDepthTexture` (log depth → view z),
   `opacity = smoothstep(0, 1.5·fwidth, thickness)`, colour mixed from
   `SHALLOW_COLOUR` to the sea's over `clamp(3·fwidth, 6 m, 2 500 m)`.
   Constants in `lib/land-colour.ts` (`SHALLOW_COLOUR`, `SHALLOW_THINNEST`,
   `SHALLOW_THICKEST`), one test.
2. Worker: `land: high < -SHALLOW_THICKEST ? null : ground`.
3. Typecheck, eslint, prettier, land-colour test pass. Pushed c84a7c7e0.

## Left

- Play run, desktop and phone, five heights; orbit + 1 000 km frames into
  `notes/r6/`; check open-water colour unchanged; WebGL 2 depth copy with MSAA.
