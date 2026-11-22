# Ground — hand-over note

Branch `claude/island-beauty-ground`. Package: what the land's surface looks
like. Everything here was shot on WebGL2 under software raster; the WebGPU
device dies in this container, so nothing below was seen on WebGPU.

## What the baseline's patterns were, and which code drew each

- **A contour map from orbit to 300 km.** Five flat colours with soft edges
  that follow the height's level lines, white blobs hundreds of kilometres
  wide wherever the plateau's noise passed 1650 m, and no light on the relief
  at all. Drawn by `GROUND_STOPS` read straight through `groundColourNode`:
  colour was a clean function of height, and at that distance a pixel averages
  the mesh's normals flat.
- **The speckle over land from 800–2000 km in the fine look** is not the
  ground: it is the clouds' cell pattern (clouds' package). In the plain look
  the same heights show a vertex-scale mottling that comes from the relief's
  finest retained octaves on coarse tiles (relief's package).
- **Same-sized soft hills everywhere from 1–30 km** — the relief recipe
  (relief's package).
- **Nothing at all underfoot**: one smooth colour with blurred rock smudges on
  steep ground. The only fine relief was the sea's 256 m ripple table reused
  through `groundRelief` in WGSL, which repeats every 256 m and exists on
  WebGPU alone.

## What draws the land now

- `lib/land-octaves.ts` — ten lattices from 175 km to 11 cm, each rotated its
  own way, none a multiple of another. `anchorOf` places the eye in each
  lattice in float64, modulo 4096 cells, so a fragment's place is exact near
  the eye anywhere on the planet and no pattern comes round within sight.
- `ui/land-noise.ts` — the lattices as TSL: value noise with its analytic
  slope, each octave pushed about by the next coarser one's slope (so no
  cell's square outline shows) and faded to its mean between 8 and 2.5 pixels
  per wave (so far ground neither shimmers nor draws a moiré).
- `ui/land-bands.ts` — the four bands' materials and borders. A border is a
  smoothstep over height plus noise at every scale still told, widened by the
  amplitude of what is no longer told, so a far border averages rather than
  sharpens. Steep ground reads as higher; rock shows by slope; snow lies over
  `BAND_HEIGHTS.snowLine` on gentle ground and slides off steep. No latitude.
  Forest is the tile's `cover` attribute, its vertex-to-vertex edge broken by
  the fine octaves; the shader invents no forest of its own.
- `ui/land-surface.ts` — the two looks. Fine: all ten octaves, rock's beds,
  and the small relief as a normal from the octaves' slopes (TSL, so WebGL2
  draws it too). Relief gone under a pixel dims the ground instead. Plain: the
  four coarsest octaves through the same bands — four noise samples a
  fragment — on the mesh's own normal. Both draw the mesh's lean out by up to
  ×4 between 40 km and 1500 km away, so relief still reads by its light from
  orbit.
- The waterline: under 4 m the colour is `GROUND_STOPS`' own, untouched, and
  `surface.damp` wraps the output as before.

## Outside my files

- `lib/ground-wgsl.ts` is read by nothing of the land any more; only
  `lib/sea-wgsl.ts` still lists it (`SEA_LISTING`). Dropping it there deletes
  the file.
- `latticeValue` in `ui/land-noise.ts` is the same float hash the clouds use;
  one home for both would sit below `ui/`.
