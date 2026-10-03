# rh-e — T139, the cap on a turned screen

## Done

- 0d391410 `isCrowdedAt(meadow, foot, from = foot)` counts `MUSHROOM_SLOTS`
  within `D_SEE` of the foot or of the anchor `from`; `roomFor` passes its
  anchor. Test in `model/game.test.ts` (a ring of twelve at 0.9·`D_SEE`: a
  gap foot is free by its own circle, crowded by the anchor's).

## Decided

- The reducer's `grow` still counts round the foot alone: the action carries
  no anchor, and `roomFor` picks the foot before the tap, so the anchor rule
  gates every grow the scene sends. Carrying the anchor in the action would
  touch `arrivals.ts` and `visit-play.ts`, outside this package.

## The bar still fails — stopped, for the orchestrator's call

`+` at the opening until refused, then the screen turned (a scratch play,
not committed); tappable = a point on screen whose tap reaches the mushroom
(`__probe.mushroom(id, true)`):

| screen | before (review) | after 0d391410 | opt. A both orientations | opt. B landscape only |
| ------ | --------------- | -------------- | ------------------------ | --------------------- |
| phoneL | 5 of 22         | 5 of 12        | 9 of 9 (refuses at 9)    | 9 of 9                |
| tabL   | 6 of 15         | 6 of 12        | 12 of 12                 | 12 of 12              |
| tabP   | —               | 12 of 12       | 12 of 12                 | 12 of 12              |
| phoneP | —               | 12 of 12       | 12 of 12                 | 12 of 12              |
| phoneS | —               | 12 of 12       | 12 of 12                 | 12 of 12              |

The cap holds twelve now, but a landscape opening spreads them wider than
portrait shows: stranded ones are the far-left and far-right feet.

- **A**: `roomFor`'s screen test also requires every cap corner `EDGE_MARGIN`
  inside the turned screen (`meadowCamera(height, width)`, same eye, the cap
  scaled by the two views' scale ratio at the foot), on every screen.
- **B**: the same, on landscape screens only.

Both strand nothing; both hold phoneL's opening to 9, which is "room
permitting" but a count that changes with the screen. Controls and the
sun on the turned screen were not part of the scratch test.
