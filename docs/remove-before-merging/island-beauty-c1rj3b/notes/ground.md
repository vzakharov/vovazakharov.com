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
- `ui/land-mix.ts` — the octaves by name (`COUNTRY` … `GRAIN`) and the few
  ways a material is mixed from them. An edge is a smoothstep over a value
  plus noise at every scale still told, widened by the amplitude of what is
  no longer told, so a far edge averages rather than sharpens.
- `ui/land-bands.ts` — the four bands put together: which band by height
  (`BAND_HEIGHTS`, steep high ground reading higher), rock by slope, snow, the
  beach over all of it, and each material's roughness. No latitude.
- `ui/land-beach.ts` — sand wherever a 0…1 sandiness says, whatever the
  height or slope: wet colour at the waterline drying pale, a wrack line,
  marram tufts where the sand thins. Sandiness is the tile's per-vertex `sand`
  attribute (`SAND_ATTRIBUTE`), less what the forest covers; the shader keeps
  no distance to the coast of its own.
- `ui/land-lowland.ts` — meadow (growth, hay, rushes in hollows, earth banks)
  and forest. Forest near the eye is the tile's `cover` attribute; between
  1.5 km and 5 km it gives way to what the height and the shader's own
  coarse lattices expect, because a tile's cover changes with its level and
  drew straight tile edges from 4 km up. The two do not agree place for
  place: a forest's outline shifts as the eye crosses that range. A meadow
  takes on the moor's turf between 120 m and 340 m and the moor keeps green
  under 620 m, so the border between the two is one palette.
- `ui/land-upland.ts` — moor (tussock clumps, heath, sward, stony soil),
  alpine ground (turf, soil, scree), rock with level beds, and snow: over its
  ragged line, the line up to 1100 m lower on ground leaning toward the pole
  (`Ground.poleward`, from the mesh's normal) so its outline follows the
  relief, slid off faces past about forty degrees near the eye, by height
  alone past 400 km so a range keeps a white spine.
- A rough shore (`ROCKY_ATTRIBUTE`) is bare rock from the water to 3–9 m,
  dark where the sea wets it; no sand and nothing grown on it.
- `ui/land-surface.ts` — the three looks. Swift: the fine one over the eight
  coarsest octaves (the two dropped are `ABSENT`: gone without widening any
  edge, where an octave lost to distance is `QUIET` and widens them), with rock's ledges and not the leaves within one; it draws
  only once `scene-look.ts` passes `look === 'swift'` to `dress`. Fine: all ten octaves, rock's beds,
  and the small relief as a normal from the octaves' slopes (TSL, so WebGL2
  draws it too). Relief gone under a pixel dims the ground instead. Plain: the
  four coarsest octaves through the same bands — four noise samples a
  fragment — on the mesh's own normal. Both draw the mesh's lean out by up to
  ×4 between 40 km and 1500 km away, so relief still reads by its light from
  orbit.
- The waterline: under 4 m the colour is `GROUND_STOPS`' own, untouched, and
  `surface.damp` wraps the output as before.

- Forest near and far: within 300 m the fine look paints `cover` as the
  shaded floor — litter and moss — and from 600 m as canopy, in the trees' own
  leaf colours (`LAND_PALETTE.broadleaf`, `.conifer`) times 0.75, broken into
  crowns a few steps across, lit tops over dark gaps. The conifer
  heights (250–520 m) and the thinning height (450 m) repeat figures in
  `model/forest-cover.ts`; they must move together.
- Dry bare sand carries wind ripples 11 cm long, their phase following the
  eye in float64 (`ripplePhaseOf`), fine look only.

## Cost

Measured only under software raster on WebGL2 (wall-clock per frame at
1100×700), which says little about an M2: the fine look went from about
2.0–2.4 s to 2.2–3.1 s near the ground, the plain look from about 0.9 s to
0.4–1.0 s. Before, the fine look on WebGL2 drew no small relief at all, so
part of the rise is relief WebGL2 never had.

Lattice reads a fragment: fine 12 (ten octaves, two for rock's beds), swift 9
(eight octaves, one for the beds), plain 4. Nothing else in a band samples:
every patch, edge, clump, ripple and snow line is arithmetic on those reads. Nobody
has measured the land's share on the target machine yet.

## Still wrong

- Curvature is not known to a fragment, so snow follows aspect and height
  and not gullies as such.
- Underfoot the ground is still soft past a few metres: the finest octave is
  11 cm, and nothing draws blades, stones or twigs.

## Outside my files

- The shoal under water at the shore draws as a blurred cream smear: under
  0 m the land keeps `GROUND_STOPS` untouched so the waterline matches, and
  the tint over it is the ocean shader's.
- `BAND_HEIGHTS` are set to where the present relief's uplands (about 500–800
  m) and ranges (over 1000 m) stand; a relief that moves them moves the bands
  off their country.

- `pnpm knip` fails on one export of the relief's (`detailReach`), not read by the ground.
