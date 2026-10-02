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

Frames (tabL): `tabL-opening`, `tabL-brow` (walked back: flowers going under the
round brow by the clump), `tabL-perched-turned` (the butterfly still on its
cap after the turn), `tabL-back-row-tap` (the russula selected from the back
row), `tabL-key-planting` (the pink flower `l` planted on a tuft, bottom).

## tabP (820×1180 @2) — A 4m31s, B 8m00s

Spec §4's checks — **all pass**:

- Opening identity: 15 things within 0.000 px. `flower-1` past the brow,
  sunk 6.8 px, 77.1 of 80.5 px showing, off the screen at x −975.
- Insect after the turn: seat held within 0.00 px over 33 frames, to
  heading 0.32.
- Walk to the back row: `mushroom-3`, 1.00 → 1.54×, 12.31 → 8.00 ahead,
  haze 0.268 → 0.016; outside tap and cap tap pass.
- Frame budget into the forest: **19.7 ms median over 646 frames** (slowest
  4752). Screen medians 17.4 (A), 22.4 (B).
- Walk: ↓ 5 under the cover, at most 15.3 px over it. Keys: `l` planted,
  `h` replaced. Walking into a hovering fly: zoom 1.70× (bound 1.78).

Reds:

- **Known class** — the dash bound: 8 fly steps over 66.2 px at its own
  size (most 112.4, 179 px drawn, fly-28 air→cap at zoom 1.59 while walked
  into), 133 bee steps over 37.3 (most 56.3).
- **New, the flier watch** (same family as tabL's): butterfly-3 turned
  188.18 rad/s in one frame (bound 10.81) at 18 383 ms; bee-3 174.57 rad/s
  (bound 21.62) at 10 417 ms and faced 2.87 rad off its way; butterfly-4
  1.83 rad off its way, and sat 1.93 rad off facing up; bee-3 sat 1.54 rad
  off. Spans pass here (butterfly 58, fly 39, bee 51).
- **New, `hold`**: a held press on the planted flower `planted-1` opened no
  picker (no ring, 0 colours, no cross), so it was not pulled and no tuft
  came back. `tabP-hold-no-picker.png` shows the frame: no planted flower
  anywhere on the screen, so the press likely landed where the flower is not
  drawn (a bee-planted or off-screen flower picked by the play), not a dead
  picker; unsettled — the seeded flower's hold on the same screen passed.
  Did not fail on tabL.
- **The sky hairline again**: `tabP-brow.png` and `tabP-hold-no-picker.png`
  carry the same faint flat line, at ~280 CSS px from the left edge to
  ~x 425, over the far hills' sky — so it is not one heading on one screen.

Frames (tabP): `tabP-brow` (walked back: the clump and flowers on the round
brow; the hairline at top left), `tabP-back-row-tap` (a fly agaric selected
from the back row), `tabP-hold-no-picker`.

## Stopped here

The orchestrator stopped the run after tabP: the operator asked for game
changes (insects sinking behind the brow, insect shadows, fly motion,
strafing), and the five-screen run is to be redone after they land.
phoneP, phoneL, phoneS and the phoneL edge-flower judgement were not run.
