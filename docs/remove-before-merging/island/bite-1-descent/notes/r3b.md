# R3b — slope light

Done:

- `ui/ground-lighting.ts`: the land and sea materials and their lights. One sun
  direction (`lib/sun.ts`, `sunToward(elevation, azimuth)`), low over the
  north-west; the land takes more of it than the sea (`lightsNode` per
  material), so the land's exposure rises while level sea keeps its old
  colour. One sky (hemisphere) light shared.
- Land colour per fragment: `colorNode` blends `LAND_STOPS` (now linear) by the
  interpolated `height` vertex attribute; `landColour` on the CPU blends the
  same stops the same way.
- `lib/colour-heights.ts`: skirts under upland take their border's height for
  colour, since a per-fragment blend down a skirt otherwise crossed the sand
  band and drew pale lines along tile seams at 1 000 km.

First play run (sun 25°, before the skirt fix), desktop: 10 km visibly
brighter, hills lit top-left and shaded bottom-right, readable but soft; 1 000
km snow smooth-edged per fragment, but pale lines along tile seams (the skirt
crossing the sand band — fixed since, unverified). The x≈720 vertical seam in
the snow stays: per-fragment colour does not hide it (the two levels' heights
differ there, terrain's `finest`).

Left (context budget hit mid-run):

1. A play run of the pushed code (sun now 20°): check the seam lines are gone
   at 1 000 km, the sea's colour unchanged at orbit and 1 000 km, contrast at
   10 km and 100 m. If 10 km is still soft, lower the sun further or the sky
   fill on land (a land-only hemisphere at ~0.5).
2. Commit the ten frames only if better at every height.
3. `tile-worker.ts` still computes `landColours` per vertex and ships them;
   nothing draws them now — drop `colours` from `Land` and the worker
   (outside R3b's paths).
4. `colour-heights.ts`'s `borderWalk` repeats terrain's private `borderLoop`
   (the skirt order `TileMesh` documents); terrain exporting it would remove
   the copy.

Scratch prettier reformatted page files outside these paths (no
`.prettierrc.json` width honoured there?); those were reverted, but check
`pnpm format:check` on the branch.

Surprised: the skirt's band-crossing (above) only shows once colour is per
fragment; per vertex it was a brown-to-navy blend nobody saw.
