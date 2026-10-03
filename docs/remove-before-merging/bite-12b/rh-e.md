# rh-e — T139, the cap on a turned screen

## Done

- `isCrowdedAt(meadow, foot, from = foot)` counts `MUSHROOM_SLOTS` within
  `D_SEE` of the foot or of the anchor `from`; `roomFor` passes its anchor.
  Test in `model/game.test.ts` (a ring of twelve at 0.9·`D_SEE`: a gap foot
  is free by its own circle, crowded by the anchor's).

## Decided

- The reducer's `grow` still counts round the foot alone: the action carries
  no anchor, and `roomFor` picks the foot before the tap, so the anchor rule
  gates every grow the scene sends. Carrying the anchor in the action would
  touch `arrivals.ts` and `visit-play.ts`, outside this package.

## Left

- Measure the bar: phoneL and tabL, `+` at the opening until refused, then
  turn the screen; count mushrooms on screen and tappable.
