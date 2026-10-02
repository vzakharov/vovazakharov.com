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

- **Step 2, `fliers.test.ts` runs at full length; the speed-up is real.**
  48 cases (6 viewports × 8: the air, 2 × 2 all-ten, the bees, the flies,
  the catch), 48/48 green in 2 min 0 s here. The file changed only in
  f83d06c (an import), `LASTING` 5 min / `TICK` 250 untouched, and
  `visit-play.ts`'s `play` loops `now` to `lasting` with no exit. Probe
  over the all-ten visits (6 × 2 × 3) at f83d06c (I2, the 5 min 9 s run)
  and at this tip: 1201 ticks to 300 000 ms in every visit on both; the
  bees plant 66–81 flowers a visit now against 109–171 then, and each
  `perchSight` rerun after a planting costs 3.2–5.3 ms against 5.8–14.2
  (fewer flowers to place), so those visits take 33 s against 106 s. The
  drop came with L3's 48-flowers-within-sight cap (56a1df4, "bee rings no
  longer sow the endless field without bound") and the planter's rules
  from the eye between I2 and I3–I5's run, not from the test.

## Left

- Step 3 (full play run, frames).
