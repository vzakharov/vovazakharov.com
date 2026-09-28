# Bite 8, scene agent — paused

## Done (committed with this note)

- **Painting split by head** (`ui/scene/`): `draw-mushroom.ts` dispatches
  (and keeps shadow/selection, plus the porcini's stem net);
  `mushroom-paint.ts` holds `MushroomBrush`/`mushroomBrush`, `paintStem`
  (`{ inkLaid }`), `inkStem`, `paintCapLight` (every `CapLight` kind);
  `paint-dome.ts` fly agaric / porcini (pale margin band) / russula (paler
  centre); `paint-trumpet.ts` chanterelle: funnel ink and stem ink laid
  before both fills so no line crosses the joint, funnel light, ridges
  (`ridgeLines`, tapered), then the lip and its light.
- **Colours** (`palette-creatures.ts`: `porcini.*`, `chanterelle.*`,
  `russula.*`, `russulaGills`) read per mushroom through
  `mushroom-tints.ts` (`mushroomTints`, `porciniMargin`, `russulaCentre`,
  `haloFor`). Porcini brown = mix(tan, chestnut) by hue nudge; test asserts
  it stays out of luminance 0.021–0.045 (broken once on purpose: fails).
- **Light**: `capLight` gives a chanterelle `shade`/`rim` on the lip's outer
  shoulders plus `dip-shade` (sun-side wall) and `dip-light` + shine (far
  wall); tested. `stemLight(lit)` replaces the fixed colour (`STEM_LIGHT`
  kept).
- **HUD**: per-species `iconGenes` (fat porcini club, flat rose russula,
  short broad chanterelle); icon height uses the drawn crown.
- **House**: a window's/door's outer edge gets a pale `rimLight` line where
  its ink would not stand 3:1 off the cap/stem (dark porcini caps).
- **Door taps**: HEAD already failed play on phoneS (the clump's two door
  tap circles overlap after the new `doorStations`). Fixed in the scene: where
  circles overlap, the nearer door's middle wins (`HouseView` `nearest`,
  `MushroomBed.nearestDoor`).
- **Play run**: `scripts/lib/play-species.ts` grows each species from the
  picker, shoots `s1-<species>-selected/-wobble` close-ups (clip via
  `__probe.bounds`), `s2-meadow`, `s3-butterfly-on-<species>`,
  `s4-house-porcini/-chanterelle`. phoneS green, median 13.0 ms.

## Left

- Play tabL, tabP, phoneP, phoneL; copy their frames (only phoneS committed).
- Contact shadow for the porcini (item 5) untouched.
- Look side by side with Syama's drawing; not yet done carefully.

## What still reads wrong

- Porcini in the meadow is not stocky: its stem reads thin (genes are the
  model's; the icon fakes it).
- The chanterelle's lip reads as a flat plate over a narrow funnel; hazed far
  away it goes tan. Its stem is long for a chanterelle.
- `s2-meadow` is full of growth spores: wait longer before the shot.
- Porcini pores barely show (the gills oval is a sliver).
