# Bite 10, picker follow-ups (group `picker-2`)

## Done

- 731be30 tufts grow only where a flower can stand: grown from the stand
  (`growTufts(stand, random)` in tufts.ts), each spot in the flowers' band
  kept only where `roomIn` (flower-sight.ts, the bees' rule read once per
  stand) holds and heads-apart from every tuft kept, so planting on one
  never refuses another. A tuft at the root of each flower the child
  planted when the grass regrows. Seam grass (`seamGrass`, grass.ts) drawn,
  not tappable. Share of tufts taking a flower on the opening meadow:
  phone 0.20 -> 1.00, small phone 0.17 -> 1.00, 280 px 0.11 -> 1.00;
  a phone grows 20 tappable tufts (was 31, 24 of them refusing).
  Play step updated; phoneS and phoneL played, pass.
- 122e44f pickers on 280 px: a picker's rest goes in the band beside the
  mute only where it holds them apart, else in rows under its own
  (`completed`, sky-layout.ts). Controls test now over FLOOR_HELD too.

## Decisions

- Tufts from plantable spots (alt: widen the flower band to reach them —
  would put flowers at the horizon and on the screen's edges, breaking
  in-sight). Tufts heads-apart from each other (alt: denser grass whose
  neighbours refuse once one is planted).
- Seam grass kept as horizon texture, not tappable: a tap there deselects
  silently (alt: drop it, which re-lines the seam an earlier bite broke up).
- 280 px pickers stack 3 + rest under, like the flower picker's stages.

## Defects seen, not fixed

- 568x320 (small phone turned): the pickers are r 10 and overlap the house
  (pre-existing; `pickerRow` drops abreast when the height, not the width,
  limits the radius). No layout test covers that screen.
- phoneL: the shape stage's fourth button touches the house button.
- The play run has no refusal shot when the grown flower covers its tuft
  (both phones): the refusal is reachable only on an occupied tuft or a
  full meadow.
