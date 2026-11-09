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
  the lowland), which is not option 3: built in the second run, below.
- **Fill time** (Node, the worker's stitched land+sea fill over every tile three
  poses select — Vova's sand, B9c-2's #2 hill at 10 km, #1's coast at 10 km —
  median of 5 per tile, two runs each): 16,833 → 17,650 ms over 588 tiles,
  **ratio 1.05** (sand 1.05, hill 1.05, coast 1.05; run-to-run noise ±4 %).
  Driver: `tmp/floor/bench.ts`, not committed.
- Fitted coasts: the field fit reads no relief; #0/#1 coasts unchanged.

## Frames

`b3-floor/sand-121m-before.png`, `sand-121m-after.png` (1440×900, Vova's pose,
before = base relief, after = option 3). Looked at (second run): the band is the
same flat unshaded sheet in both.

## Soft floor (second run, 6130a442)

- `restingGround`: under a band over the floor, ground is no longer rounded onto
  it but squeezed: `floor + band·e^(over/band − 1)`, `over = height − floor`. It
  meets `height` at the band's top with slope 1 (C¹), is strictly
  order-preserving, ≥ height, ≥ floor, and ≥ the hard version everywhere (the
  map grows with the band, and at band = lowland it already clears the old
  smoothMax). Band = 15 m × reach + `SQUEEZE_METRES` (200) × reach·(1 − reach)³:
  0 at the coast, widest ~1.4 km in (≈ 24 m), ≈ 22.6 m at 1 km, back to the
  lowland's 15 m × reach a dozen km in. `lowlandFloor` unchanged.
- `groundSlope` adds `SQUEEZE_METRES / LOWLAND_REACH_METRES` to the lowland term
  (the band's d-slope ≤ (15 + 200)/5 km; the map's ∂/∂band ≤ 1/e).
- Tests (10, all pass): ≥ hard floor on 5000 random points; monotone and a
  trough 30 m under the floor at 1 km keeps > 5 % of its relief (9.7 %);
  identity a dozen km in for ground ≥ 15 m over the floor; coast tests
  unchanged; `groundSlope(2π)` bounds a central finite difference of `reliefAt`
  along a path in from the coast, every octave a sine, 40 phases, 0–20 km.
- Width chosen by measurement: 100 left 0–1 km level 6–10 %, 400 lifts ground up
  to +35 m and changes 98 % of 0.5–1 km points; 200 sits between.

## Soft-floor numbers

- **Share 0–1 km at the lowland height** (≤ 1.25 × 15 m × reach; 40,000 random
  points within 30 km per world, ~1,370 of them 0–1 km): #0 36.3 → 22.0 (hard) →
  **0.3 %**; #1 36.3 → 22.2 → **0.2 %**. This metric rewards the lift itself, so
  also **level** (ground slope over 2 m < 0.01, all octaves): #0 34.0 → 24.9 →
  **3.8 %**, #1 34.3 → 24.4 → **3.6 %**. 1–2 km level 2.6/2.7 %, 2–5 km 6.1/7.2
  % (hard 19.4/21.3 %).
- **Change vs base**: never lower; 0–1 km 82 % of points changed, max +27 m
  (hard: +25 m); 5–10 km 23 %, max +3.7 m; 10–30 km 9 %, max +2.4 m — those are
  far-inland level basins (broad relief under the lowland) now squeezed too.
- **> 12 km where the hard floor left the noise's own height**: 21,763 (#0) /
  21,777 (#1) points; soft differs at 1 point on #0, by 1e-5 m (the band is
  wider than the lowland by 200·r(1−r)³ there), 0 on #1.
- **Coast**: field fit reads no relief, so #0/#1 fitted coasts unchanged; the
  zero crossing stays (band → 0 at d → 0; coast test passes).
- **Fill time** (`tmp/floor/bench.ts`, rebuilt: world #1, eyes 121.6 m / 1 km /
  10 km over Vova's spot, every ~10th tile of each no-frustum selection, 228
  tiles, median of 3, two runs interleaved): base 13,585 ms, hard 13,361, soft
  13,124 → **soft/base 0.97** (noise ±7 %; no measurable cost). Not the
  predecessor's tile set, so not comparable to its 1.05 in absolute terms.

## Soft frame

`b3-floor/sand-121m-soft.png` (1440×900, Vova's pose, shot 60 s after load — an
immediate shot catches the scene before tiles arrive). **Verdict: yes, the band
shades.** Beside `-before`/`-after` the level sheet is gone: the band reads as
gently undulating ground with soft dimples and slopes, continuous with the dunes
around it, at lower contrast than they have (its relief is squeezed, not
restored). The hummock that stood alone on the sheet now sits in rolling ground.

## Left

- Whether the band's contrast is enough is the lead's call; more is a wider
  `SQUEEZE_METRES` (400: level 0–1 km ~1 %, but +35 m lifts near the coast).
