# Group B hand-over (bite 7, creatures and HUD)

All of B1–B7 and the step-0 `air` switch are in; nothing is half-done, so
there is no patch beside this note.

| SHA     | What                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| f261846 | `ink.ts` (+ tests): `inkFor`, `innerInk`, `weightedOutline`, `taperedLine`, `facingArc`, `shadowFall`; `colour.ts` Phaser-free, with `darken`, `luminance`, `contrast`, `dimTo`                                     |
| e2ceaca | Mushrooms: one light from `sunLight(layout)` (hairline = 1 device px) via the scene; shade/shine/rim on the sun's sides; `shadeCool`, `capLit`, `rimLight`; cast shadow; haze to `PALETTE.air` (mushroom and house) |
| d8b6aa0 | Flowers: weighted ink, petal rim/shade, tapered stem ink, cast shadow; `groundShadow` removed                                                                                                                       |
| 5a2968c | Insects and HUD pictograms (`PICTOGRAM_LIGHT`): weighted ink, tapered legs/antennae/proboscis, wing-eye rim ring                                                                                                    |
| af5adca | House and mouse: `Brush.lighting`, weighted ink, inner plank line, tapered whiskers                                                                                                                                 |
| 1b0c18e | B5: flowers and butterflies softened and turned toward yellow; `hud` warm white; `palette-creatures.test.ts`                                                                                                        |

Deviations:

- `inkFor`'s clamp is `min(0.06, what 3:1 against its own fill allows)`,
  floored at 0.012: 0.06 alone gives a red cap 2.2:1 against its ink.
- Insects are painted once and turned with their heading, so their shade
  turns with them; repainting on every turn would cost a repaint a frame.
- A clear wing keeps a stroke (an underlay would show through the glass).
- The house has no cast shadow of its own; it rides on its mushroom's.

Play run: three screens 438 s after the insects' change, against 342 s for
two before it (and 510 s for two under load from the other group) — no
measurable growth. Not done: a closer look at `tabP`/`phoneL`.

Frames (gitignored, `tmp/bite7/B/`): `tabL-perched.png`,
`phoneP-mouse-front.png`, `phoneS-open.png`, `crop-cap.png`,
`crop-butterfly.png`, `crop-flower.png`.
