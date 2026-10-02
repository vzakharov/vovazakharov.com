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

## Step 2 — what the surviving overs are: the pivot shortens the flight

Taken up although 13 cut-leg overs remain, because what remains of that
class has the from-rest class's size (46–47.6 against fly-21's 45.8), so
the drawn place's fix did its part and one cause looks to be left under
both. Traced by reading, one hypothesis, measured; no fix built.

**Hypothesis.** `steer` (`model/insect-steering.ts`) flies a leg's path
from `departs: leg.departs + turning` to the leg's own `arrives`, where
`turning` is `pivot(leg, setOff.turns)` (`model/insect-motion.ts`):
`PIVOT_SHARE` (0.25) of the flight times `|lifted| / π`, how far round the
flier sat from its heading. But `legTo`/`paced` (`model/flight-timing.ts`)
time the flight as the leg's length at `cruising` over the **whole**
`arrives − departs`. So a flier that turns on its perch first flies the
same length in `1 − share` of the time: every frame of its dash is
`1 / (1 − share)` faster than the curve, up to 1.33× for a turn right
round. The harness's bound (`dashPeak`, `veer-dash.ts`) is the curve's
fastest frame with no pivot, × 1.1.

**Measured** (local scripts over the run's samples, not committed): the
share of its time each leg sat still before it moved (`flown` > 0.01),
against its fastest drawn frame over `dashPeak`.

| leg (class)              | still for | 1 / (1 − still) | peak / dashPeak |
| ------------------------ | --------: | --------------: | --------------: |
| fly-29#2 cap→cap whole   |     0.191 |            1.24 |            1.28 |
| fly-3#2 cap→cap whole    |     0.187 |            1.23 |            1.24 |
| fly-26#2 cap→cap whole   |     0.156 |            1.19 |            1.23 |
| fly-31#2 cap→cap whole   |     0.161 |            1.19 |            1.17 |
| fly-7#2 cap→air          |     0.119 |            1.14 |            1.22 |
| fly-20#2 air→cap         |     0.241 |            1.32 |            1.24 |
| fly-33#3 air→cap         |     0.258 |            1.35 |            1.23 |
| fly-30#3 cap→away (rest) |     0.074 |            1.08 |            1.13 |
| fly-7#19 cap→away, none  |     0.006 |            1.01 |            0.86 |
| fly-22#3 cap→away, none  |     0.053 |            1.06 |            0.88 |

Every leg with an over sat still 0.09–0.26 of its time; the legs that set
off at once peak under the curve. The drawn lengths are right — over the
whole leg, path drawn over length timed is 1.01–1.04 for the long legs
(fly-21#3, 24#3, 29#2, 29#3) — so the excess is time, not distance. The
three long away legs that carry 19 of the 43 (fly-21#3, 24#3, 29#3) set off
from a cap off the screen's right edge and are hidden for their first
0.27–0.30 of their time, so their still share is not measurable; their
peaks, 1.32–1.37× the curve, are a fly turning about right round (≤ 1.33)
plus the flutter `dashPeak` leaves out. That is inferred, not measured.

**Why not built.** It is the game's — the leg is timed for a flight it
does not get — but no fix is small: `legTo` does not know `lifted` (the
scene decides it from how the flier sat, `setOffFor`), so the model cannot
add the pivot to the flight; and because `pivot` is a share of the flight,
lengthening the flight lengthens the pivot with it. The options, for the
next agent or the orchestrator:

1. The pivot stops being a share of the flight: a time of its own by the
   kind and the turn (a fly "snaps round"), which `steer` takes from before
   `departs` or adds after `arrives` — changes when every leg lands.
2. `steer` keeps the pivot inside the flight but lets the path start
   moving during it (the turn overlapping the lift-off), so the curve keeps
   its whole time — changes how a take-off looks.
3. The harness's bound allows `1 / (1 − PIVOT_SHARE)` — makes the check
   pass and leaves the fly's dart up to a third faster after a turn.

A person can judge whether the dart after a turn reads as a jolt: in
`to-check.md` under v18.

## Left

- The pivot call above (options 1–3).
- butterfly-1's 0.38 rad heading.
- phoneP veer, not run.
