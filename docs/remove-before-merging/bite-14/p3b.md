# Bite 14 — P3b hand-over: the sweep's showers (R1)

## Done

- `ui/scene/visit-play.ts`: `opened(seed, w, h, forest, viewIn?, showers = 0)`.
  After the forest grows, each shower is a `rain` reduced at
  `index × (RAIN_MS + SPORE_FALL_MS + SPROUT_MS)` (so every earlier sprout
  is old again), then at its `stopsAt` `shedding(meadow, stopsAt, () => true)`
  → `shedIn(standOf(...), shedders, view)` → `sprouted`. `showers` 0 is the
  old `opened` exactly (tested).
- `visit-play.test.ts`: no shower opens as before; one shower sheds 1–3 of
  the oldest's species within `SPROUT_REACH`, records the shed, and a second
  shower keeps the first's mushrooms as they were.
- `scripts/sweep-mushrooms.ts --showers N`: the forest and opening-crop
  meadows are showered; with N > 0 a third meadow per visit, the opening
  clump alone on its opening crop, showered: how many visits shed a sprout
  there, and the same checker (most hidden, no patch, under a fingertip)
  over those clumps. The forest's "12 in" counts what `+` grew, not sprouts.

## Decided here

- `opened` calls `sprouted` directly rather than `reduce`'s tick: the tick
  needs a `Sight`, and with no insect released the tick is `sprouted` alone.

## R1 numbers

Stopped on the orchestrator's word (calls 30–35 replace the shed). Showered
runs over all 2000 visits; the no-shower line is `--visits 200` (its full
run and small phone `--showers 1` were cut). No invariant broken: hidden
shares reach the bounds exactly (an exact scratch check, tablet, 100 visits,
3 showers: max cap 0.25, stem 0.5, none over), never past; no patchless
mushroom anywhere.

| screen          | 0: hidden cap/stem (200) | 1: forest sprouts · clump shed | 1: clump hidden · fingertip | 3: forest sprouts · clump sprouts (median) | 3: clump fingertip |
| --------------- | ------------------------ | ------------------------------ | --------------------------- | ------------------------------------------ | ------------------ |
| tablet          | 23.5 / 35.8              | 1893 · 2000/2000               | 25.0/50.0 · 16.7%           | 1906 · 15279 (8)                           | 23.7%              |
| tablet portrait | 15.4 / 19.4              | 1935 · 2000/2000               | 25.0/50.0 · 0.0%            | 1944 · 15325 (8)                           | 0.0%               |
| phone           | 23.5 / 42.2              | 1883 · 2000/2000               | 25.0/50.0 · 47.8%           | 1897 · 15241 (8)                           | 65.2%              |
| phone sideways  | 14.7 / 43.3              | 959 · 2000/2000                | 25.0/50.0 · 100%            | 966 · 15024 (8)                            | 100%               |
| small phone     | 23.5 / 35.8              | —                              | —                           | 1842 · 15240 (8)                           | 91.1%              |
| desktop         | 15.4 / 19.4              | 1935 · 2000/2000               | 25.0/50.0 · 0.3%            | 1944 · 15325 (8)                           | 0.4%               |

- With showers the forests (world, no view) reach cap 24.8% / stem 49.4–50.0%
  most hidden, against 14.7–23.5 / 19.4–43.3 at 200 visits without.
- The forests on the opening crop (12 already within `D_SEE`) shed 0–4
  sprouts over 2000 visits: R5 holds.
- A second and third shower add ~1.5 sprouts each to the clump (3 → 8
  median, slots cap at 12); the forests gain almost none after the first.
- Cost: ~200 ms a visit without, 220–430 with one shower, 470–670 with three
  (three sweeps sharing four cores with other agents).
