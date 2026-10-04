# Bite 17 — package `hz`: far mushrooms glow at dusk in flight

Review-play item 2. **Done** (one landed commit).

- `PALETTE.airDusk` (0x404c66, `palette.ts`): what distance takes a thing on
  the ground toward at full dusk — darker than `DUSK.air` (which only the
  backdrop's ranges mist toward), every dusk range crest and the ground's top.
- `haze-tone.ts`: `hazeAir(dusk)` mixes `air` → `airDusk` by duskness;
  `hazeTone(haze, dusk)` is the one tone the mushroom brush and the house
  brush use.
- Caching: a mushroom's paint is cached; `repaint-queue` repaints one when
  `paintedHaze × |dusk − paintedDusk| ≥ HAZE_DRIFT`, inside the existing
  `REPAINTS_PER_FRAME` (2) cap, nearest first — a near mushroom (haze ≈ 0)
  never repaints for the dusk. With no view (laid out) `MushroomBed.update`
  runs the same queue. `meadow-scene` passes `dusk.level` to `bed.update`.

Measured (phoneP, flight at full dusk, walked back; rel. luminance):
porcini cap 0.206 → 0.057, back amanita cap 0.205 → 0.057, chanterelle
0.176 → 0.080, against the hill behind at 0.089. Stems 0.35–0.40 → 0.13–0.17
(still above the hill: white stems, not in the ask). Steps at dusk unchanged
to the eye. Frame: `../frames/bite-17/hz/phoneP-flight-dusk.png`.

Left: spores (`spore-bed.ts`) and mice (`runner-shown.ts`) still haze toward
the day air; both could take `hazeTone(haze, dusk)` the same way.
`mushroom-bed.ts` is ~485 lines, past the ~450 rule of thumb.
