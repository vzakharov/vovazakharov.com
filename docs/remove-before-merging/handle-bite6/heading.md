# Heading group (T59 flight fix) — paused

## Done

Nothing committed. Only a baseline play run (build with
`NEXT_PUBLIC_MUSHROOM_PROBE=1`, then `pnpm play:mushrooms --no-build`) on
HEAD 32fb4dc; its log is `tmp/handle-bite6/heading/play0.log`.

## Half-done in the working tree

Nothing. No source edited by this group.

## Left

All of it: fix the take-off turn (`bodyTurn`'s `LIFT_TURN` 450 ms blend in
`model/insect-motion.ts`, capped by `TURN_RATE` 10.8 rad/s in
`ui/scene/insect-view.ts`), the landing approach, and the butterfly's
bowed path (`model/insect-paths.ts`, arc 0.3) so no leg turns more than one
full turn — until the flier watch passes on all 5 screens, without loosening it.

## Baseline measurements (first pass / second pass per screen)

| Screen | Worst heading (rad) | Frames > 0.3 off (butterfly / fly / bee) | Most turns on a leg |
| ------ | ------------------- | ---------------------------------------- | ------------------- |
| tabL   | 2.15 / 1.83         | 92/1629, 50/194, 138/1056 / bee 24/497   | 0.88 / 0.94         |
| tabP   | 3.04 / 1.94         | 90/1280, 58/279, 187/1271 / bee 78/837   | 1.02 / 0.82         |
| phoneP | 3.05 / 1.98         | 11/850, 60/229, 773/3371 / bee 61/906    | 1.02 / 0.50         |
| phoneL | 1.78 / 2.19         | 138/2545, 101/427, 70/687 / bee 34/519   | 0.67 / 0.47         |
| phoneS | 3.13 / 1.75         | 42/765, 995/2387, 461/2597 / bee 47/869  | 1.09 / 0.61         |
