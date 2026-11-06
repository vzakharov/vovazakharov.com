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

Left: tune against frames, commit frames.

Surprised: the skirt's band-crossing (above) only shows once colour is per
fragment; per vertex it was a brown-to-navy blend nobody saw.
