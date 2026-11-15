# b3-b9d — closing the T-junction (B9c option 1)

## Done

`tile/model/tile-indices.ts`: `gridTriangles(grid, coarse)` and the cached
`tileIndices(grid, loop, coarse)`. Along an edge a one-level-coarser tile meets,
the fine tile's border triangles fan to the even border vertices only, so each
border edge is one of the coarse tile's edges. The odd vertex stays in the
buffer: the skirt still hangs from it. Where two coarse edges meet, the 2×2
corner cells fan round `(1, 1)`. Corner levels do not change the indices,
because a corner vertex is used either way. One buffer per grid and edge set
(16), cached; each fill gets a copy it can transfer. `assembleTile` and
`liftCubeLattice` take `coarse`, and `fillStitchedCubeTile` passes
`coarseEdges(key, levels)`, so ground and sea both get it. Heights, normals and
skirt are unchanged.

Tests (`tile-indices.test.ts`), all 16 edge sets on grids 5, 9, 17 and 65:

- every triangle winds counter-clockwise, and the areas sum to `cells²`;
- every coarse segment is a triangle edge, and no skipped vertex is used;
- every edge sits in two triangles facing each other, except the outline's.

## The look: sparkle unchanged, and it is not the T-junction

I rebuilt the export with the fix (and confirmed the bundle carries it), then
reshot with B9c's driver (`look.ts.txt`, writing to `b3-b9d/`).
`1-edge-1000km-down`: 1 pixel differs from B9c's frame, by 1 grey level. The w2
frame: 244 pixels differ, by at most 4, all of them land. Every sparkle pixel is
the same pixel with the same colour, so B9c's counts stand: 10 and 25. My own
counter (`tmp/look/sparkle.py`: all-sea 5×5, RGB sum ≥ 6 over the median) finds
17 and 31, the same set before and after.

Scratch builds, each reverted, with frames in `tmp/look/scratch/` (not
committed):

| change                                           | sparkle pixels                                   |
| ------------------------------------------------ | ------------------------------------------------ |
| globe at `R − 15 km` instead of `R − 1.5 km`     | identical, 0 px differ                           |
| `globe.visible = false`                          | identical, 0 px differ                           |
| skirt heights −1e6 m, sea painted red below −2e5 | identical (only a weak test, see below)          |
| sea albedo constant `(0.1, 0.3, 0.5)`            | still off: darker, (97,159,195) in (110,176,210) |

What these show:

- **It is not the globe showing through.** Hiding the globe changes no pixel, so
  B9c's reading — a T-junction leaking the globe at `R − 1500` — is wrong. That
  is why closing the T-junctions could not move the count.
- **It is not the sea's floor colour alone.** With a constant albedo the pixel
  still differs, and the other way: darker, where it was brighter. So it is a
  different surface, or one lit differently, whose colour still follows the
  floor's.
- **Best remaining suspect: the skirt.** A sliver in the grid surface would show
  the skirt beneath. The skirt is sea material, its height is
  `floor − skirtDepth` (a different colour), and it is lit by the border normal,
  possibly seen from behind. The red test is weak exactly where it matters: just
  under the edge, the skirt's interpolated height has barely moved off the
  floor, so it never reaches the red threshold.

## Left

- The next test: drop the skirt triangles from `tileIndices` (scratch) with the
  globe hidden. A hole then shows the sky. If the sparkle turns sky-coloured,
  the grid has a sliver along that edge, and the skirt was only hiding it.
- If so, measure the sliver. The fine and coarse tiles' clip-space positions of
  the shared vertices come from different float32 tile-centre offsets (≈ 0.1 m
  at 1,000 km, under a 1 km pixel). That is far too small for runs of 3–6 pixels
  along a line of slope ≈ 1/16, which need a sliver ≈ 0.2–0.4 px (≈ 200–400 m)
  wide. So also check that the cover drawn at that edge is the stitched variant
  B9c logged (`px|6|61|42`, right edge 5), and not a fallback without `coarse`.
