# Heading group (T59 flight fix) — paused, part done

## Done

- **ebb4b2c** moves the per-frame flight step out of `ui/scene/insect-view.ts`
  into a pure `model/insect-steering.ts` (`steer`, `startLeg`), with its test
  `model/insect-steering.test.ts`. The test flies legs the watch's way; it fails
  with the old flutter and with the unwinding turned off.
  - Take-off turns on the spot before moving: `pivot()` in `insect-motion.ts`
    takes `PIVOT_SHARE` 0.25 of the flight × |lifted|/π. The turn completes at
    `TURNED_BY` 0.75 of the pivot. The turn cap is set per kind in steering.
  - `heading()` in `insect-paths.ts` is the line's chord over one flutter bob,
    and the `follow` setting is gone. The flutter is capped at `FLUTTER_REACH`
    0.04 of the distance. `BANK_TURN` is 0.45.
  - The bow side is chosen, and the bow scaled down (`Path.bow` is now a
    number), to minimise the leg's sweep. Near a half turn (`EVEN` 0.35), the
    lift and the settle unwind the leg.

## Play run on ebb4b2c (run in a worktree at HEAD, since the perch agent's WIP `flight.ts` breaks `roaming.test.ts`)

Worst heading error in rad, first pass / second pass (before this fix → after):

| Screen | Before      | After       | Most turns on a leg (after) |
| ------ | ----------- | ----------- | --------------------------- |
| tabL   | 2.15 / 1.83 | 1.41 / 0.17 | 0.54                        |
| tabP   | 3.04 / 1.94 | 0.47 / 0.14 | 0.58 (was 1.02)             |
| phoneP | 3.05 / 1.98 | 2.68 / 0.15 | 0.63 (was 1.02)             |
| phoneL | 1.78 / 2.19 | 0.38 / 0.17 | 0.60                        |
| phoneS | 3.13 / 1.75 | 0.29 / 0.17 | 0.60 (was 1.09) — passes    |

Log: `tmp/handle-bite6/heading/play1.log`. The spin bound now passes everywhere.
The heading bound still fails on 4 screens.

## Left: two remaining failure kinds (unmet)

1. **A fly in its last 80–130 ms before landing on a cap** faces 1.4–2.7 rad
   off (tabL fly-8, phoneP fly-7). Its travel is right at the 1 span/s floor
   (8–14 px over the window), so the fly is nearly still and something moves
   it backwards. Suspects:
   - the perch's end moving (the cap breathing or swaying) while the heading
     aims at `aim`, the perch's spot as the leg set off;
   - the tail of the flutter.

   Check it with `tmp/handle-bite6/heading/sim.ts`, adding a moving `end`. If
   it is the perch's motion, steer toward the live `end` for the last stretch.

2. **A butterfly flying in from off screen** (legs 1, from x > 1) is 0.38–0.47
   rad off late in its flight. Its first leg has `sat` undefined, so its bow is
   full. Look at its heading versus `aim` near arrival.

The harness (`node --import tsx tmp/handle-bite6/heading/sim.ts 60`) passes
with a worst of 0.20 rad. It does not model perch motion or legs flown in from
off screen, which is likely why it misses both failure kinds.
