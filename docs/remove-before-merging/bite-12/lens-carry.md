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

## Stopped by the subagent context budget, before item 4's source

**Item 4, measured, not built.** `entry`'s fallback to `pastEnd` fires in
two cases: no view (before the eye's first fit), and `groundAlong` finding
no layout row (the brow's ground behind the opening eye's row,
`gathered(plane).y ≤ 0`: a ±3.4° wedge straight behind the plane's origin,
since `SPREAD` 1.96 takes ±176.6° to ±90°). Swept: eyes on a 2-unit grid
over `GLADE`, headings every 0.02 rad, columns at 0.3 / 0.5 / 0.7 of the
width, the start at `D_SEE + PAST_BROW`: **0.76 % of starts have no row on
every screen**, and the nearest column whose brow ground has one is at most
58 / 98 / 45 / 28 / 37 / 76 px off (tablet, tablet portrait, phone, phone
sideways, small phone, desktop). Every case found a column with a row on
the screen.

The build the measure supports (not a choice the plan made; for the next
agent or the orchestrator to confirm):

- looking back: set off at the screen column nearest the wanted one whose
  ground at that distance has a row (a 1 px outward search, release-time
  only), for the start and for the no-perch `near` alike;
- before the first fit: set off just past the opening crop's edge nearer the
  perch (`offScreen` with no view, which is inside the world), not
  `pastEnd`;
- `offScreen`'s own `pastEnd` fallback is for a leaving insect, not a
  release, and is outside this item.

Scratch scripts (not committed, in the scratchpad's `lc/`):
`release-hidden.mts` (the step 1–2 measure) and `no-row.mts` (the sweep
above); each runs as `WT=<worktree> node --import tsx <script>` from the
worktree.

## Round 2

Item 4 as above, confirmed by the orchestrator; items 5–6, the `flight.ts`
seam, `fliers.test.ts`, the frames.

### Done

4. **A release looking back sets off at the nearest column with a row**
   (`groundNear` in `insect-away.ts`, used by `entry` for the perch-shown
   start, the no-perch start and the no-perch `near` alike): `groundAlong`
   searched a px at a time outward across the screen. Before the first fit
   `entry` returns `offScreen` with no view, just past the opening screen's
   edge nearer the perch; `pastEnd` stays only for a screen where no column
   has a row (none found in the sweep). Looking straight back from the
   plane's origin (heading π) the middle column has no row on every screen
   and the start lands 22–77 px off it. New tests: `insect-away.test.ts`
   "looking back, …" and "before the eye's first fit, …" (both red on the
   old source).

5. **An insect is culled by its own drawn extent** (`reachesScreen` in
   `insect-away.ts`, applied in `InsectView` to the drawn middle): hidden
   once a box a span each way round its middle (its wingspan times the zoom
   it is drawn at, so any turn, the body and antennae stay inside) is wholly
   off the screen. `drawnAt` no longer culls by `V_NEAR`; it hides only a
   point at or behind the eye (`ahead ≤ 0`) or buried under the brow. The
   `InsectView` docstring says so. `offHost` keeps `cull`: there it stands
   for the host's own cull (a mushroom nearer than `V_NEAR` is not drawn,
   and an insect on it hides with it via `onSeat`). New tests:
   `insect-away.test.ts` "draws a flier nearer the eye than V_NEAR while its
   extent reaches the screen" (red on the old source) and "hides an insect
   only once a span each way …".

## Left

6 (`V_NEAR`'s ceiling under the lens), the `flight.ts` seam (461 lines),
`fliers.test.ts` alone (not run: this package changed `drawnAt`, the sink,
the cull and `firstFlight`'s no-perch leg), the tabL / phoneP release frames
`lens-carry-*.png`.
