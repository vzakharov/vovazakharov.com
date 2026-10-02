# v18-play — tabL veer, meadow after v18-drawn-place

Under the play-run rule, at `3ba1696` (game code as at `e66e719`). Frames in
`frames/bite-12/v18/`.

## The play run — `--screens tabL --plays veer,meadow`

Deterministic: a build run and a `--no-build` run gave the same overs to the
step.

- **Fly over-bound steps: 43, worst 47.6 px own size against 38.1** (v17:
  88, worst 71.0). By leg, from a local tally over the run's samples (a dump
  of `seen` from `play-veer.ts`, not committed):

  | class                     | v17 | v18 | v18's legs                                                                                                   |
  | ------------------------- | --: | --: | ------------------------------------------------------------------------------------------------------------ |
  | cut mid-flight, then away |  58 |  13 | fly-24 (cap→cap at 0.71) ×6, 46.4; fly-29 (cap→cap at 0.47) ×6, 47.6, the worst; fly-19 (cap→cap at 0.94) ×1 |
  | cap→away from rest        |   9 |   9 | fly-21 ×7 (6.95 s, 45.8), fly-26, fly-30                                                                     |
  | cap→cap whole             |  14 |  14 | fly-3 ×4, fly-26 ×2, fly-29 ×5 (6.54 s, 44.1), fly-31 ×3                                                     |
  | cap→air                   |   2 |   2 | fly-7, fly-33                                                                                                |
  | air→cap                   |   5 |   5 | fly-33 ×4 (heading −0.36), fly-20                                                                            |

  fly-10 and fly-15 are gone, fly-29's cut leg fell from 71 to 47.6. What
  is left of the cut class looks like the from-rest class: the long legs
  away (6.3–6.95 s, across the whole screen), over at flown 0.49–0.51 by
  12–25 %. **Every** fly over in the run sits at flown 0.49–0.55 (fly-33's
  air→cap at 0.32 the one exception) — the dash's peak, which is where a leg
  timed short of its drawn length shows first.

- **Bee overs: 21, worst 29.8 against 25.8** — bee-17 flower→flower, the
  known small class, unchanged.
- **Shying fly's heading**: fly 0 of 286 travelling frames over 0.3 rad.
  butterfly-1 (away→away left, `steering.heldAt` at 24 717 ms) faced
  0.38 rad off, 83 of 3901 butterfly frames over 0.3 — a red still
  standing, as at v17.
- Other reds as before: a fly drawn 27.3 px across, under 30
  (`LEAST_SPANS`); a butterfly 38.2 px across, under 52.
- Frame median 21.9 ms (778 frames), 22.3 on the `--no-build` run.

## Frames

`tabL-f2-fly-startled.png` is the only one of v17's four that changed;
`tabL-veer-back-fly-in`, `tabL-veer-turning` and `tabL-veer-walk-in-5` are
byte-identical to v17's, kept so the set compares one to one.

## Left

- Step 2 (below, once written): the surviving classes.
- butterfly-1's 0.38 rad heading.
- phoneP veer, not run.
