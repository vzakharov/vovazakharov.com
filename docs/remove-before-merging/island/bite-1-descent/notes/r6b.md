# R6b — the coastline in the shader (paused, code reverted)

## Outcome

No shader change stands. c84a7c7e0 (depth-texture sea + worker keeping land to
-2 500 m) was pushed and then reverted, because on the WebGL 2 fallback it does
nothing useful and adds pale tile-seam lines at orbit. The branch's code is as
it was before R6b.

## What was tried

1. **R6's design (sea reads `viewportDepthTexture`)** on three 0.187.
   Debug build (sea colour = thickness, raw depth, fwidth): **the depth texture
   reads 0 everywhere on WebGL 2**, with `antialias: true` and with
   `antialias: false`, even over bare globe where the cleared depth should
   read 1. No GL warning appears in the console. So it is not MSAA. Untraced:
   the copy (`WebGLTextureUtils.copyFramebufferToTexture`, a depth blit) or
   the texture it lands in. WebGPU cannot be checked headless.
2. **Land draws the coast** (in the working tree only, never committed): the sea
   with `depthWrite = false`, the land `transparent` so that it draws after the
   sea, and the land's colour/opacity taken from its `height` attribute
   (`dry = smoothstep(±0.75·fwidth(h))`, shallows fading out over
   `clamp(3·fwidth, 6, 2500)` m). In the 1 000 km frame the edge stayed
   stair-stepped, no band showed, and faint seam lines appeared. So the sea
   still covers the underwater land. Not traced: whether three sorts the land
   ahead of the sea anyway, or ignores `depthWrite` on the sea.

## Next step, if the shader route is kept

- Route 2 is the one that needs no depth copy. Check first, in a debug
  build, whether the land's underwater fragments reach the screen at all. For
  example, give the sea `colorWrite = false` and see if the floor shows.
- The cleaner fix: the sea mesh carries the floor's height as its own
  `height` attribute, so the sea knows its depth with no depth texture and no
  change to draw order. That needs `tile-meshes.ts` (`geometryOf(sea, true)`)
  and the worker's sea fill to carry the ground's heights. Both are R7's paths.
- Either route needs `tile-worker.ts` to keep land down to the band's deepest
  depth (`high < -SHALLOW_THICKEST`). Otherwise the band ends at the edge of a
  tile that lies wholly under water.

## Recipe notes

Run play in a scratch copy, not under the repo. Use `git archive -o` and then
`tar -x`, because a piped `git archive | tar` inside a compound command is
refused in an isolated worktree. `pnpm play:island` ignores `--help`: it builds
and plays.
