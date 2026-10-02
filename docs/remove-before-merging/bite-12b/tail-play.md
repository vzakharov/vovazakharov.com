# Package tail-play — hand-over note

## Done

- **Step 1, the planting play's two reds — both the harness's.** On tabL
  `planting` the bees plant a flower at (971, 532), standing at depth zoom
  ~0.70; the bed draws a flower at `emerge × stands.zoom`
  (`flower-bed.ts` `update`), so `plantedAs` reading bare `scaleY` saw a
  full-grown flower as 0.70. It now reads `scaleY / stands.zoom`. The bee:
  29.1 px drawn on a far flower, 40.3 px at its own size (depth 0.72).
  `LEAST_SPANS` is the layout's own-size floor (`insectSizeFor`), and the
  insect's container is scaled by `middle.zoom` (`insect-view.ts`) like
  the host under it; its tap is floored at a finger (`tapReach`). So the
  watch now records `leastOwnSpan` beside the drawn `leastSpan`
  (`flier-watch.ts`, outside the owned files: a harness file, two lines),
  holds the own-size floor and notes the drawn one. The drawn size is a
  look call: `to-check.md` § "Хвост 12b, прогон". Green on tabL.

## Left

- Step 2 (`fliers.test.ts` at full length), step 3 (full play run, frames).
