# b3-floor — the lowland floor rolls with the broad relief

Branch `wt/b3-floor`, base 1faca859. Option 3 of `b3-b9c.md` § 0, built.

## Done

- `relief.ts`: `lowlandFloor(d, broad)` and `restingGround(d, height, broad)`.
  The floor is the height of the octaves ≥ 400 m (`BROAD_METRES`; the 781 m
  octave down to 400 km), sunk by `FINE_REACH_METRES` (84.35 m, the fine
  octaves' summed amplitude) × reach², reach = 1 − e^(−d/5 km), and held over
  the old lowland (15 m × reach) by the old smoothMax. The ground is
  `smoothMax(height, floor, lowland)`. No extra noise evaluation: the fine sum
  is split off in the same loop. `groundSlope` gains the sink's climb.
- **The sink is a departure from option 3's letter** (`max(lowland, broad)`):
  without it the floor would clip every fine trough on every continent. With it,
  ground past ~12 km is bit-identical to before (hill pose checksum equal).
  Reach² rather than reach, because reach sank the floor under the lowland at
  Vova's band (broad 6.8 m − sink 9.1 m) and changed nothing there.
- `relief.test.ts` (6 tests): floor follows the broad relief metre for metre;
  floor > 0 inland; a dozen km in it lies under the deepest fine trough; ground
  ≥ floor and ≥ height; a fine trough 600 m in climbs with the broad relief (not
  a level); coast: land for all d > 0, no step at d = 0±.

## Numbers

- **Vova's band** (centre column, y 560–580): ground 1.63/1.60/1.58 m, slope
  0.0026 → 6.04/5.84/5.95 m, slope 0.010/0.007/0.017.
- **Near-coast ground, 20,000 random points per world within 30 km**: never
  lowered; changed in 37/28/27/10/0.1/0 % of points at 0–0.5/0.5–1/1–2/2–5/
  5–10/>10 km on #1 (#0 alike), by +2–6 m mean, ≤ 29 m.
- **Still level** (ground ≤ 1.25 × lowland): 0–1 km 35.7 → 21.7 % (#1), 37.2 →
  22.5 % (#0); 1–5 km 24.5 → 23.9 %; 5–30 km 8.6 % unchanged. **Option 3 leaves
  a level sheet wherever the broad relief itself sinks under the lowland** —
  inherent to `max(lowland, …)`; a sink of reach⁴ did not help (22.6 %). Giving
  those basins relief needs a soft floor (a monotone compression of height under
  the lowland), which is not option 3: not built.
- **Fill time** (Node, the worker's stitched land+sea fill over every tile three
  poses select — Vova's sand, B9c-2's #2 hill at 10 km, #1's coast at 10 km —
  median of 5 per tile, two runs each): 16,833 → 17,650 ms over 588 tiles,
  **ratio 1.05** (sand 1.05, hill 1.05, coast 1.05; run-to-run noise ±4 %).
  Driver: `tmp/floor/bench.ts`, not committed.
- Fitted coasts: the field fit reads no relief; #0/#1 coasts unchanged.

## Frames

`b3-floor/sand-121m-before.png`, `sand-121m-after.png` (1440×900, Vova's pose,
before = base relief, after = this branch). Shot, **not yet looked at** — the
context budget ran out first.

## Left

- Look at the two frames.
- If level basins still read as flat: the soft-floor option above.
