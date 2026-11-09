# b3-coast — what a coarser coast rule buys, and what it costs to the eye

Measure only; the committed `COAST_FINER = 2`
(`src/island/entities/terrain/quadtree/model/cube-split.ts`) is unchanged. Base
1aeecf72. Drivers in `b3-coast/drivers/` (copy to `tmp/b3-coast/`).

**Recommendation: keep 2.** At 1 the waterline grows visible sawtooth at 13 km —
the steps the rule exists to hide — while saving only 0.6 s of the ~4 s
near-ground fill that prompted the question; at 0 the teeth are coarse, islets
vanish and the shore's relief goes smooth. The near-ground cost lies elsewhere
(below).

## Counts and fill time (Node)

Italy, 41° N 14° E, heading 220°, look 0 (the `holes.ts` selection: `eyeAt` →
`poseOf` → `selectCubeTiles`, 1440×900 aspect). Each selected tile filled as the
worker fills it (`fillStitchedCubeTile` with its `neighbourLevels`,
`cubeDetailCut` from the eye, the sea too where the tile dips under 0), nearest
first; the pool is list-scheduled: a free worker takes the next tile, one tile
at a time per worker (`IN_FLIGHT` only queues). Node, one thread, JIT warmed.

| world | height   | CF  | tiles | levels | fill ms med / p90 | pool 2 (s) | pool 4 (s) |
| ----- | -------- | --- | ----- | ------ | ----------------- | ---------- | ---------- |
| #0    | 2,400 km | 2   | 121   | 3–5    | 27 / 31           | 1.50       | 0.76       |
| #0    | 2,400 km | 1   | 41    | 2–4    | 18 / 29           | 0.40       | 0.21       |
| #0    | 2,400 km | 0   | 18    | 2–3    | 17 / 25           | 0.17       | 0.09       |
| #0    | 170 km   | 2   | 171   | 4–8    | 27 / 39           | 2.42       | 1.22       |
| #0    | 170 km   | 1   | 87    | 4–7    | 22 / 34           | 1.03       | 0.52       |
| #0    | 170 km   | 0   | 35    | 3–6    | 24 / 36           | 0.44       | 0.23       |
| #0    | 13 km    | 2   | 165   | 6–12   | 26 / 38           | 2.30       | 1.16       |
| #0    | 13 km    | 1   | 93    | 6–11   | 30 / 45           | 1.49       | 0.75       |
| #0    | 13 km    | 0   | 64    | 5–11   | 28 / 39           | 0.95       | 0.48       |
| #0    | 527 m    | 2   | 221   | 7–17   | 35 / 49           | 3.96       | 1.99       |
| #0    | 527 m    | 1   | 168   | 7–17   | 40 / 63           | 3.38       | 1.69       |
| #0    | 527 m    | 0   | 133   | 6–17   | 35 / 43           | 2.30       | 1.16       |
| #1    | 2,400 km | 2   | 96    | 2–5    | 18 / 28           | 0.97       | 0.49       |
| #1    | 2,400 km | 1   | 38    | 2–4    | 16 / 28           | 0.35       | 0.18       |
| #1    | 2,400 km | 0   | 18    | 2–3    | 23 / 29           | 0.21       | 0.10       |
| #1    | 170 km   | 2   | 78    | 4–6    | 27 / 34           | 1.05       | 0.53       |
| #1    | 170 km   | 1   | 50    | 4–6    | 21 / 35           | 0.60       | 0.31       |
| #1    | 170 km   | 0   | 35    | 3–6    | 18 / 35           | 0.40       | 0.20       |
| #1    | 13 km    | 2   | 64    | 5–11   | 34 / 48           | 1.09       | 0.55       |
| #1    | 13 km    | 1   | 64    | 5–11   | 33 / 53           | 1.15       | 0.58       |
| #1    | 13 km    | 0   | 64    | 5–11   | 27 / 41           | 0.88       | 0.45       |
| #1    | 527 m    | 2   | 105   | 6–15   | 37 / 49           | 2.04       | 1.02       |
| #1    | 527 m    | 1   | 105   | 6–15   | 37 / 58           | 2.09       | 1.05       |
| #1    | 527 m    | 0   | 105   | 6–15   | 32 / 50           | 1.79       | 0.90       |

- The coast rule triples the high-altitude count (#0 2,400 km: 18 → 121), but
  near the ground #0 still needs 133 tiles at 0 against #1's 105: most of the
  527 m cost is the view's own split, not the coast. Going 2 → 1 there saves 0.6
  s of 4.0 s on 2 workers; **4 workers at 2 (2.0 s) beat 1 or 0 on 2**.
- #1 has no coast in view from 41° N 14° E at 13 km and 527 m (no tile astride
  one), so its rows there are flat across the rule.
- Fill per tile stays 17–40 ms median whatever the rule: the detail cut follows
  the same rule, so a coarser tile is not dearer to fill.

## Frames (page)

Throwaway exports with the constant at 1 and 0 (reverted, never committed), same
drivers otherwise. Each frame opened fresh at 20,000 km over the pose,
`setHeight` to the height timed until it resolved (every selected tile drawn),
`setTime` to #0's afternoon over 14° E (0.07 h), heading 300° (along the coast,
sea left), look 0, 1440×900, settled. 13 km over 41° N 14° E; 527 m over 41° N
13.96° E.

| CF  | 13 km settle (s) | 527 m settle (s) | frames                         |
| --- | ---------------- | ---------------- | ------------------------------ |
| 2   | 2.8              | 7.5              | `cf2-13km.png`, `cf2-527m.png` |
| 1   | 1.8              | 5.1              | `cf1-13km.png`, `cf1-527m.png` |
| 0   | 1.3              | 3.5              | `cf0-13km.png`, `cf0-527m.png` |

(Headless software rasterizer: page settles run ~2× the Node pool model.)
`crops-13km.png`, `crops-527m.png`: the same regions at 2× side by side, 2 | 1
| 0. Pixels changed (> 16 of 255) against 2: 13 km 13.8k at 1, 38.5k at 0; 527 m
12.2k at 1, 33.0k at 0.

**What the coast loses, by eye:**

- **Coastline shape: nothing.** The bays and the curve run the same at all
  three, at both heights.
- **Jaggies: yes, at 13 km.** At 2 the waterline is a clean edge. At 1 a fine
  sawtooth runs along it (teeth a few px, plain in the 2× crop's top row); at 0
  the teeth are coarse and read as a serrated shore at 1×. At 527 m the near
  waterline stays clean at 1 and shows only a faint tooth line at 0.
- **Islets and shoals simplify.** At 13 km the S-shaped islet off the beach
  becomes two ovals at 1 and is gone at 0. At 527 m the sandbars keep their
  places but lose their inner relief.
- **Beach band: softens.** At 527 m the bumpy dunes and pits just behind the
  waterline go soft at 1 and smooth into a plain bank at 0; inland relief away
  from the shore is untouched (the view split, not the coast rule, decides it).

## Left

The ~4 s fresh fill near the ground is mostly the view's own split (#0 527 m:
133 tiles at 0); what shortens it without a visible cost is the pool (4 workers
halve it), at the 16 MB field per worker that `POOL_SIZE`'s comment weighs for
phones.
