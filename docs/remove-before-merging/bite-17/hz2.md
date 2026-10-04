# Bite 17 — package `hz2`: spores and runners haze toward the dusk air

Follow-up to `hz` (d125c5bb). **Done** (one landed commit).

- `spore-bed.ts`: a dot keeps its haze; its fill is `hazeTone(haze, dusk)`.
  `SporeBed.duskTo(level)` refills every dot when the level changed — a
  fill-style set on an `Arc`, no texture, so no repaint budget is needed.
- `runner-shown.ts`: `drawRunner` takes `{ t, dusk }` and tones through
  `hazeTone`; it repaints every frame already, so no cache to invalidate.
  `MouseRuns.duskTo(level)` holds the level it passes.
- `meadow-scene.ts` calls both `duskTo`s just before `bed.update` (which
  draws the runners). The natural home is `MushroomBed.update`, which already
  takes the level, but `mushroom-bed.ts` was off limits while it is split;
  moving the two calls there is a follow-up once the split lands.
- No other `mix(…, PALETTE.air, haze)` remains on a meadow thing; the
  backdrop's ranges keep `DUSK.air` by design.
- `haze-tone.test.ts`: a far spore and mouse fur go darker at dusk than by
  day, never past the dusk air.
