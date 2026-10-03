# Package D — review 5402118795 fixes and call 14: hand-over

The prompt named review 5328130711; the bite 16 review is 5402118795.
Inline comment ids: 4174329719 (pickers), 4174329971 (glide),
4174330238 (flowers), 4174330440 (handedness), 4174330556 (decisions),
4174330668 (rewrap).

## Done (on `wt/d`, not landed)

- Pickers: new action `{ kind: 'map' }` applies `PICKERS_SHUT`; the map
  button dispatches it (`control-actions.ts`). Tests in `game.test.ts`,
  `planting.test.ts`.
- Glide: `haltAt` (`model/walk.ts`) + `stoodStill` (`model/stride.ts`) stop
  the pan and stride dead; `EyeInput.letGo` renamed `halt` and calls it;
  `MapView` takes `halt`. Test in `walk.test.ts`.
- Call 14: `mapFrame(sunward, points, fresh, panel)` frames the sun-up box
  round every point (eye included), padded 1, fitted on both axes, scale
  capped at 2.5× the box of `fresh` (opening eye, `OPENING_FEET`, seeded
  flowers). `MapFrame` lost `reach`. Tests rewritten.
- Flowers: head floored at `LEAST_HEAD` 9 px across, painted on the 9 px
  stem.
- Probe `map()` gives `flowers`, `child`, `ahead`; `play-map.ts` asserts
  nothing off screen, left on the screen is left of the heading, the `+`
  picker shuts under the map, a flick stops dead under it (last, after
  `m4`).
- decisions.md line rewritten; to-check.md: the handedness question cut to
  the feel judgement, the phoneP 9 px line replaced by a flower-colour one.
- Docstrings rewrapped in `sound.ts`, `picker-rows.ts`, `sky-layout.ts`.
- tabL map play passes: 16 things fresh, 20 planted, 48.7 px a clump size.

- Wedge: `drawView` samples the arc and cuts each ray at the paper's inner
  edge, so the wedge stays on the sheet.
- Door crash: the bed seated doors only among mushrooms the opening eye's
  world (`layout.mushrooms`) can place; one grown where that world does not
  reach — behind it, past its sides or far edge, after any walk or turn —
  had no seat, and `furnish` threw. `doorSeats` (`door-seats.ts`, tested)
  seats such a door among the mushrooms as the eye now stands them, or
  alone. `play-map` grows a russula after the flick and gives it a door:
  red on the old bed, green now.
- Plays: map on tabL and phoneP, meadow on tabL, all pass.

## Left

Nothing; landed.
