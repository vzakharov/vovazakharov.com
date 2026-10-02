# v14-insect-depth — insects behind the brow, and their shadows

Package of bite 12, from the operator's play of version 14 (plan § "Rest of
the bite", its first two bullets).

## Done

- **Insects sink behind the brow** (`ui/scene/insect-sink.ts`). The brow
  covers what sinks because it is drawn over it (`DEPTHS.brow` −2.5 over
  things at `BEHIND_HILLS` −3.5); insects stood at `INSECT_DEPTH` over
  everything, so the only way to hide one was the cull (`buried`), hence
  «были — не стало». Now an insect whose ground point (flying) or host
  (perched) is past `D_SEE` sorts among what sinks (`depthOf`, two rows
  nearer than its ground so it stays over its host's parts), is sunk as
  before (`sunkOver`, `sunk` of the host), and the brow's ground covers it
  from below; it is hidden only once less than `SHOWN_LEAST` of its
  wingspan box shows (`sunkAway`). This side of the brow nothing changes.
  - `insect-frame.ts`: `sinkingAloft` (drawn, sunk or not, plus the ground
    under it); `drawnAloft` keeps its contract on top of it.
  - `insect-seat.ts`: `drawnFlier` returns `sinking`; `drawnSitter` no
    longer hides a seat under the brow — the sink does.
  - `view.ts`: `sunkAway` takes only `x`, `y`, `distance` (a widening).
- **A round shadow under every flying insect** (`ui/scene/insect-shadow.ts`):
  one `Graphics` ellipse per insect, drawn once in `PALETTE.shadowCool` and
  placed, scaled and faded each frame — no repaint, no filter. 0.6 of the
  wingspan wide at the ground point's zoom, its height `EYE_HEIGHT / ahead`
  of its width (≤ 0.6), so it flattens with distance; alpha 0.32 × (1 −
  haze), so it fades into the haze; sorted on its ground row half a row
  behind it (as a mushroom's shadow), so things standing nearer cover it;
  sunk with the beds past the brow, gone once sunk away. It fades out over
  the last 400 ms of a landing and in over the first 400 ms of a take-off
  from a seat; a perched insect has none.

## Decided here (not in the plan)

- **Paling is by alpha, not colour.** Beds pale by repainting with more
  haze; an insect's look is painted once per screen and repainting it per
  frame would cost the budget. Past the brow its container's alpha is
  `1 − browPale(distance)` (down to 0.8), so it shows the hazy far ground
  through it, which reads as paling.
- **The shadow's colour is the palette's existing `shadowCool`**, the
  colour every cast shadow on the grass uses; no new palette entry.
- `insect-frame.ts`, `insect-seat.ts` and `view.ts` were touched though
  the prompt did not list them: the cull lived in them.

## Left

- The play (tabL, phoneP) and its frames under
  `docs/remove-before-merging/frames/bite-12/v14/`.
