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

See the report section below (filled after the full runs).
