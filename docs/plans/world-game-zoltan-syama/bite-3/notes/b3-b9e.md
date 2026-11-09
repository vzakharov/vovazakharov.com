# b3-b9e — the 1,000 km sea sparkle is the skirt, drawn over the sea

Base 9b43c2cef. Each test a scratch build of the vova export, reverted after;
patches in `tmp/look/scratch.py` (not committed), frames in `tmp/look/scratch/`,
the decisive ones here. Counter: B9d's `sparkle.py` (all-sea 5×5, RGB sum ≥ 6
over the median), compared at B9d's own sparkle pixels.

## Finding: no hole — skirt triangles are drawn in front of the sea

Scratch A: `tileIndices` emits no skirt triangles, globe hidden
(`no-skirt/`).

| frame                            | B9d sparkle | no skirt | at B9d's sparkle pixels                     |
| -------------------------------- | ----------- | -------- | ------------------------------------------- |
| `1-edge-1000km-down`             | 17          | 1        | all 17 → plain sea (16,63,111), not sky     |
| `1-edge-w2-land-1000km-down`     | 31          | 1        | all 31 → plain sea of their neighbours      |

- **Every sparkle pixel turns the sea colour around it, none the sky.** So the
  grid surface is whole there; the sparkle is skirt fragments winning the depth
  test against a surface that should hide them. The guessed causes so far
  (globe through a T-junction, a sliver in the grid) are both out: a hole would
  show sky once both skirt and globe are gone.
- The 1 left in each frame is a different, genuine pinhole the skirt was
  hiding: (655,17) and (42,103), each one pixel of (52,81,119) — sea with a
  quarter sky, one MSAA sample. Not the sparkle; the skirt does its job there.
- 159 / 1,079 other pixels differ, by ≤ 2 grey levels off the edges (land
  ±1), i.e. skirt fragments at sub-sample coverage elsewhere.

**Why a skirt can win at all.** `assembleTile` flares the skirt one cell
outward as it drops `skirtDepth` (two cells), so seen from above each skirt is a
front-facing strip lying under the neighbour's surface, hidden by depth alone.
At the shared edge its top coincides with the neighbour's surface, so within a
sliver of the edge the two are at (nearly) equal depth and the skirt can take
samples. That matches the shape: runs of 2–3 px each time the slope-1/16 edge
passes within ~0.1 px of a pixel-centre row.

**Why it looks brighter, and whole-pixel.** The skirt carries
`height − skirtDepth`, so its colour (floor colour, lifted near the waterline)
differs from the sea it hangs from; its normal is the border's. B9d's
constant-albedo build kept the pixel off-colour, which fits extrapolated
attributes rather than the albedo: with MSAA, a fragment covering one sample is
shaded once at the pixel centre, outside the thin sliver, so `height` (and the
id build's attributes, below) are extrapolated past the triangle.

## Which tile: the stitched variant, not a fallback

The id build (`id/`; every mesh unlit in an id colour, globe hidden, the drawn
variants logged): at `1-edge-1000km-down` the cover is 56 tiles, and the drawn
variant of every one is its own cover's (`own` = `sel` = `shown`, 56 each), so
no fallback from `variantsFor`. The sparkle row sits on the border of
`px|6|62|47` (stitched, one coarse corner: levels `6|6|6|6|6|6|5|6`) and
`px|6|62|46`/`px|6|61|46` (flat); w2's line on `px|6|61|8`/`px|6|60|8` and
`nz|6|1|10`, all flat level 6. So it is **not specific to stitching or to a
level step**: equal-level edges sparkle too.

The id frame was shot with MSAA on, so the sparkle pixels decode as blends (the
tile's own id, B 50 → 38: one sample of something else, with an attribute
extrapolated out of range — consistent with the paragraph above, not cleanly
decodable). A no-MSAA id build was patched but not shot before this hand-over.

## Left (the next test, cheap)

1. Shoot the id build with `antialias: false` (`scratch.py id unused noglobe
   log noaa`): names the mesh and whether the winning fragment is a skirt
   (B 200), and whether the sparkle survives without MSAA.
2. Real materials, skirt `height` = its top vertex's height: if the sparkle
   vanishes, option 1 below is confirmed.

## Fix options

1. **Colour the skirt as its top vertex** — in `assembleTile`, give each skirt
   vertex its border vertex's height (it already has its normal). A skirt
   fragment that wins then shades as the surface it hangs from, over land and
   sea. One line; check that `colourHeights` / the sea's `floor` take the same
   skirt entries. Cosmetic: the skirt still wins, it just stops showing.
2. **Push the skirt back in depth** — draw it as a separate index group/mesh
   with `polygonOffset` (or after the grids with a strict `less` test). Removes
   the win itself; costs a second draw per tile, or a geometry group and a
   second material pair.
3. **Centroid interpolation** for `height`/normal (TSL varying with centroid
   sampling) — stops the extrapolated colour, not the coverage; partial alone.
4. **A plumb or shallower skirt** — less overlap under the neighbour, but the
   flare exists to fill pinholes seen from overhead (the one left in each frame
   above), so this trades one artefact for the other. Not recommended.
