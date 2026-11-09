# b3-b9f — the 1,000 km sea sparkle: option 1 (centroid)

Base 8c8cb0a18. Driver: B9d/B9e's `b9d.ts` (copied to `tmp/look/`, plus a
`timing` group, `FRAMES=<n>` frame timing and `SHADERS=1` GLSL capture);
counter: `sparkle.py`. The headless page runs on the **WebGL2** back end
(SwiftShader), so the GLSL path is the one measured.

## Centroid is exposed

three r187: `VaryingNode.setInterpolation(type, sampling)`
(`node_modules/three/src/nodes/core/VaryingNode.js:98`) with
`InterpolationSamplingMode.CENTROID` (`src/constants.js:1689`); WGSL emits
`@interpolate(perspective, centroid)` (`WGSLNodeBuilder.js:2166–2168`), GLSL
`smooth centroid in/out` (`GLSLNodeBuilder.js:1283–1317`). Verified in the
captured shaders.

## Height and normal at the centroid: sparkle unchanged (17 → 17, 31 → 31)

`ground-lighting.ts` routes `height` and the view normal through centroid
varyings. Every sparkle pixel stays byte-identical; only coast edges change
(7,341 / 85,678 px differ, coastline outlines). So the colour of the sparkle is
not the extrapolated height or normal.

## What the shader shows instead: per-fragment log depth

The renderer runs `logarithmicDepthBuffer: true`, so every tile fragment writes
`gl_FragDepth = log2(-v_positionView.z / near) / log2(far / near)`. A depth
written by the shader is **one value per fragment for all its covered samples**,
computed from `v_positionView` at the pixel centre — extrapolated past the thin
skirt triangle, where the skirt's plane (sloping down and outward) extended back
rises above the neighbour's surface. That is how a skirt sample wins the depth
test it should lose; with MSAA off the centre is inside its own triangle and it
loses.

Next test (running at hand-over of this revision): `depthNode` on both tile
materials = `viewZToLogarithmicDepth(centroid(positionView.z))`.

## Numbers

| build    | 1-edge-1000km-down | 1-edge-w2-land-1000km-down |
| -------- | ------------------ | -------------------------- |
| base     | 17                 | 31                         |
| centroid height + normal | 17 | 31                         |
