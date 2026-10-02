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

- **Step 3, started: tabL played in full** (all plays, build at 98fe9dd,
  18 min 55 s). Four reds, none fixed yet:
  1. `play-insects.ts:343` "no butterfly ever rested on a cap to be tapped
     through" (the butterflies-on-caps tap-through; not looked into).
  2. `play-veer.ts:270` "looking back, none of 6 fly releases took a perch
     in view": the back view grows one fly agaric (`perchesBack` grows
     exactly one), and all six flies choose `air`. Frame
     `frames/bite-12b/tabL-looking-back-cap-free-flies-take-air.png`
     shows the cap drawn free while a fly comes in;
     `…-one-cap-held-by-butterfly.png` shows a butterfly on it later.
     Likely reading (not proven): the only cap in view is held (`taken`)
     by a butterfly's leg the whole time, so `firstFlight`'s in-view
     choice has nothing but air, which would make it a harness red (one
     cap and roaming butterflies). To settle: in-page, at each fly
     release, dump `perches.sight.places` for the cap, `shownOf`, and every
     insect's `leg.to`. If held: grow a second mushroom or release the
     flies before the butterflies.
  3. `veer-report.ts:354` fly one-frame steps: 7 over 38.1 px at own
     size, the most 82.6 (fly-19 air→cap, flown 0.79–0.89, zoom 1.25,
     heading 0, x 1137, the right edge, lifted −1.27): several frames
     running 2× the dash peak near the leg's end. Suspect the seat end
     moving as the cap near the edge flips drawn/undrawn (I4's
     `seatAloft` fallback) or a re-see; not measured.
  4. Same, bee: 6 steps over 25.8 px, the most 34.0 (bee-5/bee-11
     air→flower at flown 0.41–0.48, heading π). Mild (1.3×).
     Also noted, not red: frames up to 6.5 s while walking into the forest
     (machine shared with other agents' play runs; median 25.6 ms), re-tend
     median 16.7 ms, re-sight 11.7 ms.

## Left

- Reds 1–4 above, then tabP, phoneP, phoneL, phoneS (each ~19 min; run
  one screen per call, `--no-build` after the first build, under the
  lock — a run past 10 min gets moved to the background by the harness).
- Frames kept so far: three, under `frames/bite-12b/`.
