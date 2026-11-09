# b3-b7b — call 12: sun, moon, time

Base 1323c514, branch `wt/b3-b7b`.

## Done (pushed)

- **4930a5af** step 0: `island-scene.ts` 400 → 309 lines. Tile selection, the
  in-hand check and the shown cover moved to `ui/tile-view.ts` (over
  `tile-meshes`); `TileMeshes` and `TileView` share `HeldTiles` (type-overlap).
- **a6968054** prettier on `tile-pool.ts`, `tile-cover.ts` (format only).
- **d052373c** call 12. `lib/day.ts` (`heavensAt(opening, hours)`, `daylight`,
  the `Clock` and `advance`), `sunToward(elev, az, at)` in any place's frame,
  two moon lights + night sky fill in `ground-lighting.ts` (`shine(heavens, up)`
  returns the daylight under the eye), `skyColour(height, day)`,
  `ui/time-keys.ts`, hint rows, `setTime` on the scene and hook, `EYE_KEYS`
  exported by `eye-controls.ts` and the eye's new `index.test-only.ts`.

## Numbers

- Sun's turn: about `+Y`, longitude falling 15°/h (planet turning east).
- Hour 0 is today's sun exactly over #1 (test, 1e-12) and the same 20° NW sun
  over #0's opening. That fixes the sun's declination: **45.5° N for #1, 47.2°
  N for #0** — a high-summer sun, since a NW sun at 20° stands north of both.
- So over #1's opening the day runs from −34.5° (hour 7.25, its midnight) to
  +54.5° (hour 19.25); hour 0 is a summer evening, not noon. Over #0's (38° N)
  the sun dips only to −4.8° (hour 5.2): twilight, `daylight` ≈ 0.01, not a
  full night. North of ~45° N the sun never sets. Inherent in S15 plus a polar
  turn; the alternative is the literal noon-overhead sun (map § 4 open call 1).
- Daylight: smoothstep of `sun·up` from −0.1 (night) to 0.2 (day).
- Night: moon 0.1 × each material's sun irradiance (land 0.27, sea 0.158),
  colour `0xb4c4e8`; sky fill 0.9 → 0.35, `0xc4dcff` → `0x6070a0`; air below
  100 km `0xa9cbee` → `0x1a2440`.
- Clock: opens stopped at hour 0; `[`/`]` 1 h/s (Shift 6 h/s); `T` runs it at a
  day per 20 min. Under play the keys are unbound; only `setTime` moves it.

## Left

- Frames (noon/midnight over #1): not taken, see report.
- `sphere-world.test.ts` fails prettier on the base (not mine).
