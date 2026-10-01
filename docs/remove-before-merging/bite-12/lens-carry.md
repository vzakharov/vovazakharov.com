# lens-carry — hand-over note

Package: the half-depth package's carried items (`drop-in.md`'s and
`v-near.md`'s Left), each re-measured under the panoramic lens.

## How the releases are measured

A scratch script (not committed): every screen of `VIEWPORTS` × 11 headings
(−0.6 … 0.6) × 11 screen columns × 17 perch distances (0.62 ·
`CLUMP_DISTANCE` … `D_SEE`) × 3 kinds, the seat two insect sizes over the
foot, kept where `drawnInsect` shows the perch on the screen and `entry`
gives no `out`; the real `steer`, 60 fps, the leg `min(ARRIVAL, the kind's
mid flying time)`. "Hidden" is the time `drawnInsect` draws nothing before
the leg arrives. 28 779 legs.

## Done

1. **A flier sinks by its ground point** (`sunkOver` in `view.ts`,
   `flownAt` in `insect-away.ts`, used by `drawnAt` and `offHost`): past the
   brow, an insect in the air is lowered as far as `sunk` lowers the ground
   point under it, not mirrored about its own middle.

   |                      | median | p95 | p99  | max  | legs hidden > 150 ms |
   | -------------------- | ------ | --- | ---- | ---- | -------------------- |
   | before (middle)      | 50 ms  | 233 | 1317 | 1483 | 1767 (6.1 %)         |
   | after (ground point) | 33 ms  | 50  | 67   | 133  | 0                    |

   New test: `insect-away.test.ts` "sinks a flier past the brow by the
   ground under it" (red on the old source).

2. **`PAST_BROW = 0.000_75 · D_SEE`** (0.009998 at `D_SEE` 13.33, today's
   0.01 to 0.02 %). Measured, after step 1:

   | share of `D_SEE` | in clump sizes | median | p95 | p99 | max | > 150 ms |
   | ---------------- | -------------- | ------ | --- | --- | --- | -------- |
   | 0.003 75         | 0.05           | 67 ms  | 100 | 133 | 400 | 95       |
   | **0.000 75**     | 0.01           | 33 ms  | 50  | 67  | 133 | 0        |
   | 0.000 5          | 0.0067         | 33 ms  | 50  | 50  | 117 | 0        |
   | 0.000 1          | 0.0013         | 17 ms  | 17  | 33  | 50  | 0        |

   Kept the value `drop-in.md` took; a smaller share hides less, measured
   above, for the orchestrator.

3. **A no-perch first leg is lengthened** (`outFirst` in `flight-in.ts`,
   used by `firstFlight` when the screen shows no open perch): by
   `min(ARRIVAL, leg)`, so `outOfView` of the lengthened leg is exactly the
   added stretch and the rest, past the screen's side to the perch in the
   world, takes as long as the model timed it from the screen's edge, at the
   kind's cruise. Before, that rest flew `T − min(ARRIVAL, T / 2)` of the
   leg's `T`: 1.6–2.7× its cruise for a butterfly (`T` 2.4–3.9 s), 2× for
   a fly or bee under 3 s. Not a lens matter (the timing is the model's), so
   nothing to re-measure on the screen. `flight.ts` stands at 461 lines.

## Left

4–6 of the package, `fliers.test.ts`, the frames.
