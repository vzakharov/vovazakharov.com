# Bite 9: the mushroom suite, file by file

Every `src/pages/mushrooms/**/*.test.ts` (48 files), each run on its own
with `node --import tsx --test` at ff55bc6: all green, 212 s in all, none
over 60 s. Todos are `fliers.test.ts`'s three `AIR_UNMET`, which fail as
todos by design.

| file                                 |    s | tests |
| ------------------------------------ | ---: | ----: |
| `ui/scene/layout.test.ts`            | 51.3 |    48 |
| `ui/scene/perch-sight.test.ts`       | 35.5 |    25 |
| `ui/scene/meadow-rules.test.ts`      | 24.6 |    12 |
| `ui/scene/flower-plots.test.ts`      | 24.6 |    23 |
| `ui/scene/fliers.test.ts`            | 16.0 |    45 |
| `model/house.test.ts`                | 13.8 |    12 |
| `ui/scene/flower-layout.test.ts`     | 10.3 |    42 |
| `ui/scene/mushroom-light.test.ts`    |  4.3 |    24 |
| `ui/scene/ink.test.ts`               |  4.1 |    12 |
| `model/insect-steering.test.ts`      |  3.9 |    21 |
| `ui/scene/insect-layout.test.ts`     |  3.8 |    18 |
| `model/chanterelle-outline.test.ts`  |  3.3 |     4 |
| `model/mushroom-pose.test.ts`        |  2.3 |     7 |
| `ui/scene/backdrop-tones.test.ts`    |  1.1 |    30 |
| `model/placement.test.ts`            |  1.1 |     8 |
| `model/roaming.test.ts`              |  1.0 |     3 |
| `ui/scene/sun-layout.test.ts`        |  0.9 |    18 |
| `model/mushroom-outline.test.ts`     |  0.9 |     4 |
| `model/mushroom-genes.test.ts`       |  0.9 |    12 |
| `ui/scene/mushroom-tap.test.ts`      |  0.8 |     4 |
| `ui/scene/mushroom-tints.test.ts`    |  0.7 |    11 |
| `ui/scene/skyline.test.ts`           |  0.4 |     7 |
| `model/motion.test.ts`               |  0.4 |    27 |
| `model/insect-paths.test.ts`         |  0.4 |    11 |
| `model/insect-motion.test.ts`        |  0.4 |    18 |
| `model/insect-light.test.ts`         |  0.4 |    19 |
| `model/insect-genes.test.ts`         |  0.4 |     8 |
| `ui/scene/grain.test.ts`             |  0.3 |     5 |
| `ui/scene/baking.test.ts`            |  0.3 |     3 |
| `model/swarm.test.ts`                |  0.3 |     9 |
| `model/proboscis.test.ts`            |  0.3 |     5 |
| `model/flight.test.ts`               |  0.3 |    18 |
| `model/flight-kinds.test.ts`         |  0.3 |    10 |
| `model/buzz-rest.test.ts`            |  0.3 |    10 |
| `ui/scene/sound.test.ts`             |  0.2 |     6 |
| `ui/scene/palette-creatures.test.ts` |  0.2 |     2 |
| `ui/scene/icon-genes.test.ts`        |  0.2 |     1 |
| `ui/scene/ground-seam.test.ts`       |  0.2 |    10 |
| `ui/scene/door-tap.test.ts`          |  0.2 |     4 |
| `model/pollen.test.ts`               |  0.2 |     8 |
| `model/light.test.ts`                |  0.2 |     3 |
| `model/insects.test.ts`              |  0.2 |     3 |
| `model/ground.test.ts`               |  0.2 |    18 |
| `model/geometry.test.ts`             |  0.2 |     3 |
| `model/game.test.ts`                 |  0.2 |    36 |
| `model/flower-genes.test.ts`         |  0.2 |     4 |
| `model/buzz-genes.test.ts`           |  0.2 |     6 |
| `ui/scene/insect-tap.test.ts`        |  0.1 |     5 |

Cut in this step: `perch-sight.test.ts` (over 580 s → 36 s: 500 visits with
the clump, 80 with a full forest, 62b3cac).
