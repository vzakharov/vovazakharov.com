# mp — the open map's compass follows dusk (review-read1 item 3)

Done. `map-view.ts` gives the compass a layer of its own (`compass`, between
`veil` and `top`); `MapView.update` compares `duskyAt(duskness)` with the moon
last drawn and, only on the frame that differs while the map is open, clears
that layer and redraws the compass at `Drawn.compass`. A redraw on open or
resize resets the memory from `MapSnapshot.dusky`. The shade and veil already
followed `duskness` every frame through their alphas, so nothing else changed.
`map-compass.ts` is untouched.

Verified: a local, uncommitted edit of `play-dusk.ts` opened the map straight
after the sun's tap — sun on the compass early, the moon at full dusk, and the
frame identical to one shot after reopening. The unmodified `dusk` and `map`
plays pass on phoneS.

Left: nothing.
