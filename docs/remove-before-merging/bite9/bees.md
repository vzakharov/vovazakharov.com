# Bite 9: the bees with a full forest

**Both halves of the call.** A second ring, twice as far out, takes the phone
and the tablet upright past `LEAST_PLANTED` 4 with a full forest; the small
phone does not reach it with any ring, so its full forest asserts a measured
floor of 3 (`LEAST_IN_A_FOREST` in `flower-plots.test.ts`) and `LEAST_PLANTED`
4 holds everywhere else, the opening clump and the thinned clump included.

## What changed

`RING_SLOTS` (`flower-plots.ts`) keeps its six near slots, in the same order
(a planted flower's `ring` index means what it meant), and adds twelve at
2.3 of the parent's size: beside it either way, before it, behind it, at
every 30°. Every guard a slot is held to is unchanged: `groundFor` (the band,
off every claimed foot, heads apart) and `flowerInSight` on this screen,
whatever the genes; `flower-plots.test.ts` still asserts each planted flower
in sight, on its ground on the screen and on it turned, off every foot and
flower.

## Planted with a full forest, 200 visits (`tmp/bite9/bees/why.ts`)

| screen          | before: median / mean | after: median / mean |
| --------------- | --------------------- | -------------------- |
| phone           | 4 / 3.85              | 6 / 5.35             |
| tablet portrait | 3 / 2.81              | 5 / 4.56             |
| small phone     | 2 / 2.39              | 3 / 2.63             |

Over the test's 20 visits: phone 3 → 6, tablet portrait 3 → 5, small phone
2 → 3; landscape screens stay at 7 (the limit).

## Why the small phone stops at 3

What rejects a ring slot there, with a full forest: a mushroom's foot
(~55%), the band (~25%), heads apart (~20%), sight (~18%). More slots do
not move it: 39 slots (a third ring at 3.5) and 213 (rings every 0.6 out to 5) both measured a median of 2–3 over 20 visits. An upper bound — a planter
free to plant anywhere in sight on a 3 px grid, not only beside a flower —
reaches a median of only 4 (range 1–6, 20 visits): the frame is floor-bound
(`fill.md`) and six mushrooms take most of its ground. A bee planting beside
the flower it drinks from cannot beat that bound, so 3 is the floor asserted.
