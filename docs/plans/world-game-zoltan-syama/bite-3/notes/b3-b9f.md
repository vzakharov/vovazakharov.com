# b3-b9f — the 1,000 km sea sparkle: fixed by a centroid-sampled depth

Base 8c8cb0a18. Driver: B9d/B9e's `b9d.ts` (in `tmp/look/`, plus a `timing`
group, `FRAMES=<n>` frame timing and `SHADERS=1` GLSL capture); counter:
`sparkle.py`. The headless page runs on the **WebGL2** back end (SwiftShader).
Frames in `b3-b9f/`, `base-*` and `f-*` (the fix).

## The cause: a depth written per fragment, taken at the pixel centre

The renderer runs `logarithmicDepthBuffer: true`, so every tile fragment writes
`gl_FragDepth = log2(-v_positionView.z / near) / log2(far / near)` (captured
GLSL). A depth the shader writes is **one value for every sample the fragment
covers**, and `v_positionView` is interpolated at the pixel centre — outside the
thin flared-skirt triangle, where the skirt's plane, sloping down and outward,
extrapolates back to above the neighbour's surface. So the skirt takes the
samples it covers along the shared edge. B9e's reading (MSAA + extrapolation)
was right; the extrapolated attribute is the depth, not the colour.

**Fix** (`ground-lighting.ts`): both tile materials' `depthNode` is the same log
depth, from `positionView.z` routed through a varying with
`InterpolationSamplingMode.CENTROID`. The skirt's depth is then taken inside its
own triangle, under the neighbour, and loses. Skirt, its flare and MSAA kept.

## Option 1 as briefed (height and normal at the centroid) did nothing

three r187 exposes it: `VaryingNode.setInterpolation(type, sampling)`
(`node_modules/three/src/nodes/core/VaryingNode.js:98`), WGSL
`@interpolate(perspective, centroid)` (`WGSLNodeBuilder.js:2166–2168`), GLSL
`smooth centroid in/out` (`GLSLNodeBuilder.js:1283–1317`), confirmed in the
captured shaders. With `height` and the normal at the centroid the sparkle stayed
17 / 31, every sparkle pixel byte-identical, so the colour was never the cause.
Those two varyings are not in the fix.

## Numbers

| frame                        | base | height+normal centroid | + depth centroid | depth only (shipped) |
| ---------------------------- | ---- | ---------------------- | ---------------- | -------------------- |
| `1-edge-1000km-down`         | 17   | 17                     | 0                | 0                    |
| `1-edge-w2-land-1000km-down` | 31   | 31                     | 0                | 0                    |

- **Pinholes stay hidden**: B9e's no-skirt pinholes, (655,17) and (42,103) in
  either axis order, are plain sea in the fix, the same bytes as base.
- **Other pixels**: 507 / 1,522 differ in the two sparkle frames — skirt
  fragments along tile edges no longer winning.
- **Vova's sand pose** `#1@10.35272,-0.47434,121.6,16.1,10.2,0.000`: base renders
  byte-identically twice; the fix differs at 6,012 px (1,957 by > 2, max 92), all
  on tile edges — the same skirt speckle along land seams, gone; the scene is
  otherwise unchanged (`base-`/`f-0-vova-sand-121m.png`).
- **Frame time** (20 frames each, SwiftShader, one run): `frame()` median
  3.8 → 3.4 ms at 10 km, 1.5 → 1.5 ms at 1,000 km; wall per frame (software
  raster) 1,207 → 1,311 ms and 655 → 736 ms, within this rasteriser's run-to-run
  noise as far as one run shows. No draw added; the cost is one extra float
  varying per tile vertex. Under SwiftShader, writing `gl_FragDepth` already
  disabled early-z before the fix, so nothing is lost there.

## Left

- WebGPU back end not shot here (headless takes WebGL2); the WGSL emits the same
  centroid qualifier.
