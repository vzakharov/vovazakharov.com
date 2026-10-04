# Package a-map — the moon and the map's compass: hand-over note

Calls 2, 4 and 7 of `bite-17.md`, `a-light.md`'s "Left — designed" item 7.
Paths under `src/pages/mushrooms/`. Nothing left.

## Done

- Step 1 — `ui/scene/paint-moon.ts` `drawMoon(graphics, moon, ink)`: two
  rings of 12 `moonHalo` petals as the sun's rosette is set (out to
  `SUN_RAY_REACH`), each outlined in `inkCool`; a `moon` disc; its shadow in
  `moonShade` by the pure `ui/scene/moon-shadow.ts` `moonShadow` (the disc
  less one as large moved 0.35 r toward the lit side, up-right), tested
  beside it. `crescent.ts` tapers a band along an arc rather than cutting a
  disc, so it did not fit. `PALETTE.moon`, `moonShade`, `moonHalo` added to
  `palette-backdrop.ts` with `a-light-step2.patch`'s values.
- Step 2 — `ui/scene/map-compass.ts` `drawCompass(pen, at, dusky)`: the
  map's sun, moved out of `map-view.ts` (now 430 lines), or the moon at the
  sun's radius in its place. `MapSnapshot.dusky` is set in `meadow-scene.ts`'s
  `mapShot` as `dusky(meadow.dusk, clock * 1000)` — the only place a snapshot
  is built, so the one off-limits file this package touched (an import and
  three lines in `mapShot`).

## Decided

- The moon's lit side faces up-right, its shadow low on the left, on the
  meadow and the map alike (`LIT` in `paint-moon.ts`).
- The map's moon replaces its sun outright at `dusky`; the map is drawn
  once as it opens, so there is no cross-fade there.
