# play-final2 — the five-screen run at the bite's HEAD

Plan item 2: `pnpm play:mushrooms` at 483be26 (probe built once, then
`--no-build`), one screen per call, each split in two by `--plays`:
A = `opening,meadow,walk,approach`, B = `planting,species,tufts,hold,keys,veer`.
No `src/` or script edits. Frames in `frames/bite-12/final/`.

Known reds (closed chase): tabL's dash-bound steps; phoneP's fly never
perching in view; phoneP's frame median ~27.3 ms vs 26; a release toward a
shown perch timed from the screen's edge, drawn from over the brow.

## tabL (1180×820 @2) — A 4m34s, B 5m26s, load 4.0–4.3 (the run's own Chromium)

Spec §4's checks — **all pass**:

- Opening identity: 15 things within 0.000 px. `flower-1` past the brow,
  sunk 4.0 px, 45.5 of 47.5 px showing, off the screen at x −227.
- Insect after the turn: perched on `mushroom-1`'s cap, held its seat within
  0.00 px over 69 frames, to heading 0.78.
- Walk to the back row: `mushroom-6`, 1.00 → 1.54× its opening size,
  12.91 → 8.38 ahead, haze 0.348 → 0.009; outside tap and cap tap pass.
- Frame budget walking into the forest and turning there: **19.3 ms median
  over 657 frames** (slowest 2170) against 26 — green (it was 33.5 at
  b0a652bb, before `v-near.md`). Screen medians 17.0 (A), 19.1 (B).
- Walk: ↓ 5 things under the cover, at most 9.0 px over it. Keys: `l`
  planted on a tuft, `h` replaced it.

Reds:

- **Known** — the dash bound: 109 fly steps over 45.8 px at its own size
  (most 83.1, fly-22 cap→away), 73 bee steps over 25.8 (most 30.0; the
  57.7 of the closed chase did not recur).
- **New since b0a652bb, `meadow`'s flier watch** (the meadow play was not in
  the veer rounds, which ran `veer` alone):
  - no butterfly ever rested on a cap (4 of 4 perched, on flowers);
  - butterfly-3 turned 180.91 rad/s in one frame (bound 10.81) — a ~3 rad
    flip, at 58 767 ms; butterfly-5 faced 2.84 rad off its way at 19 617 ms;
  - bee-11 sat 1.69 rad off facing up;
  - least drawn spans: butterfly 38.2 px (bound 52), fly 27.3 (30), and in
    `planting` a bee 29.1 (30). These bounds predate the decided sizing by
    distance (back caps 0.65×), so the spans are likely the check's, not the
    game's; the flip and the sideways rest are what a child could see.
- **Seen in a frame, not checked:** `tabL-back-row-tap.png` carries a faint
  one-device-px pale line straight across the sky at ~294 CSS px, from the
  hills' left to past the sun — a flat hairline at this heading, kin to the
  pale band `brow-round.md` fixed, much fainter.

Frames: `tabL-opening`, `tabL-brow` (walked back: flowers going under the
round brow by the clump), `tabL-perched-turned` (the butterfly still on its
cap after the turn), `tabL-back-row-tap` (the russula selected from the back
row), `tabL-key-planting` (the pink flower `l` planted on a tuft, bottom).
