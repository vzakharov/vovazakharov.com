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

6. **`V_NEAR`'s ceiling under the lens: 0.614 · `CLUMP_DISTANCE`** (5.30;
   was 0.613), so `V_NEAR = 0.58` stands and `view.ts` is unchanged. Bisected
   where each species' tallest head (as `view.test.ts` sizes it) crosses the
   screen's foot from the opening eye: fly agaric 0.614, chanterelle 0.647,
   russula 0.651, porcini 0.677, the same on every screen upright and turned
   (the foot is at 7.78 on all of them). Off the middle the bend only lowers
   a head, so the fly agaric's ceiling, swept across every column still on
   the screen, is 0.614 there too.

7. **`flight.ts` split at the leg's timing**: `flight-timing.ts` (110 lines)
   holds `Span`, `Dash`, `Placed`, `apartIn`, `stayAt`, `paced` and `legTo`
   — how long a flight and the stay after it take — moved unchanged;
   `flight.ts` (363) keeps the choosing of perches and the flights, and
   re-exports `Span` so its importers stand. The two import each other's
   types only, as `perch-room.ts` already does.

8. **`fliers.test.ts` alone: 48 pass, 0 fail** (3 min 43 s), at 0f4c63c.
   Re-run green beside it: every test file under `src/pages/mushrooms/` that
   imports flight, `insect-away`, `insect-seat`, `insect-view` or `view` (32
   files, among them `insect-away`, `insect-seat`, `flight-in`, `flight`,
   `view`).

### Stopped: item 4 does not hold in play, looking back

A scratch play (`<scratchpad>/lc/play-release.ts`; register it in
`PLAYS` as `['release', playRelease]`, the file
`lc/play-mushrooms.with-release.ts` has it) on tabL, two caps grown, then:

- **Walked back 3.5 (`ArrowDown`), clump near the brow, butterfly
  released:** its perch (`mushroom-3`) stood behind the brow, not drawn, so
  it took the no-perch path: it came up over the brow beside the clump
  (frame 8, 488,514 px, zoom 0.70) and flew out by the left side by frame
  32, then landed at 120. Reads right.
- **Turned to heading 3.106 (≈ π) at that eye, released:** the butterfly
  is never seen. `entry`'s start is at world x 24 013, row 1 010 748 (the
  screen is 820 tall), drawn at scale 0.000 45: `groundNear` takes the
  first column whose ground has a row at all, and at the wedge's edge
  `gathered(plane).y` is barely above 0, so `layoutOfPlane`'s row is near
  infinite and the zoom near 0. The `out` point is as far off (row
  1 708 701). The unit tests passed because they check the start's
  distance and column, not its row or zoom.

Options, not built:

1. search outward for the nearest column whose row is within the layout's
   own range (say, at most the brow row of the opening crop's bottom edge,
   `browLowest`, or a row whose `rowAt` opening stays within some multiple
   of `D_SEE`), not merely defined;
2. looking back, skip the brow start: set off just past the screen's edge
   (`offScreen` with the view), as a leaving insect goes out;
3. define the start in plane units rather than as a layout point, so a
   wedge-edge row never enters `ofLayout` (the larger change).

The sweep to choose a bound: `lc/no-row.mts` extended to report the row
and zoom `groundNear` lands on, per screen.

## Round 3

The plan's decision: a release whose brow start has no usable row sets off
just past the screen's edge (`offScreen` with the view), as before the
first fit.

### Built, not landed: `lens-carry-round3.patch`

`git apply`-able beside this note; type-checks, lints, and
`insect-away.test.ts` passes on it (8/8). Not committed as source because it
does not do what the decision is for: looking back, the insect is still
never seen.

- `entry` takes `groundAlong` at the wanted column, no outward search
  (`groundNear` gone). Where it has no row it uses `offScreen` with the
  view over the perch's `row`: from the side nearer the perch shown; with no
  perch shown, from the side across from the one it flies out by, and `out`
  is `offScreen` over the perch's row where `near` has no row either.
  Before the first fit unchanged.
- New test "looking back, flies a release across the screen over its
  perch's row, at the zoom that row is drawn at" (headings π, π ± 0.035,
  every screen): start and `out` over the perch's row, drawn just past the
  screen's edges, zoom > 0.1. Red on the current source (row ~1e6).

### Why the decision does not hold, measured

Scratch measures in the scratchpad's `lc/` (`back-leg.mts`,
`back-zoom.mts`, `back-edge.mts`, `edge-row.mts`; each
`WT=<worktree> node --import tsx <script>`). A leg sampled 201 times as
`InsectView` flies it, the point and the row mixed straight in the layout,
counted where `drawnAt` draws it and `reachesScreen` holds.

1. **A leg is flown in the layout, and looking back the screen is the
   layout's two far ends.** At heading π from the opening eye the screen's
   right edge is layout x −2 435 over the clump's row, its left edge 4 598;
   the screen shows x below the one or above the other, with the no-row
   wedge between them at the middle. Any leg from just past one edge to the
   other, or to a perch behind the eye, runs through the layout's middle —
   the meadow in front of the opening eye, behind this one. **No perch
   shown, the patch's release is drawn on 0/201 samples, start to `out` and
   `out` to perch, on every screen, at π and π − 0.035.** (Round 2's
   wedge-edge start: also never seen.) With the perch shown, 197–199/201.
2. **Over the perch's row the edge looking back stands past the brow:**
   the clump's row meets the tablet's edge 23.0 units off (`D_SEE` 13.3), so
   it starts sunk under the brow; only rows with an opening under ~5 units
   meet the edge in front of it.
3. **The real cause of "zoom ~0": a flier is drawn at its own size times
   `opening / ahead`** (`placedAt`), the opening being its row's distance
   from the opening eye. Looking back the rows wrap toward the wedge and
   their opening goes to 0, so **every insect, flying or sitting (a host's
   zoom is the same ratio), shrinks toward the screen's middle**, at any
   distance: at heading π over the brow, zoom 0.39 at the tablet's edge,
   0.17 a quarter in, 0 at the middle (tabP 0.135 / 0.052, phoneP 0.141 /
   0.054, phoneL 0.63 / 0.28, desktop 0.50 / 0.22; 1.0 facing the clump).
   A mushroom is not affected: its laid-out size grows by as much as the
   zoom shrinks. Round 2's wedge-edge start was drawn and on the screen; it
   was 0.00045 of its size.
4. **Huge rows are not themselves the fault:** with the middle column's row
   defined, the no-perch leg start→`out` draws 189–199/201 samples at every
   heading to 3.08 (rows up to 1.1e6), only at the zoom above (0.04 at
   heading 3.0 on the tablet, 0.0007 at 3.08).

Options for the orchestrator:

1. **Draw an insect by its distance, not its row's opening** (its zoom the
   ratio a thing its own size at the clump's distance would be drawn at):
   the cause, and it fixes the looking-back size of every insect, sitting
   too; round 2's wedge-edge start then shows (item 4). The larger change:
   `insect-away`, `insect-seat`, every insect test that checks a zoom.
2. **The brow start at the nearest column where the zoom reaches a floor**
   (round 2's search with a bound): 0.1 is reached 92–325 px off the middle
   at π, 0.2 nowhere on portrait and phone screens; the beaten bound, and it
   still draws the insect at a tenth of its size.
3. **The patch (the decision):** right for a shown perch, unseen with none.

Step 2 (play-check, frames) and step 3 (the Artifact page) not done: they
check a fix that is not in.

## Left

A decision on the options above, then the looking-back release built, a
test of the start's row and drawn zoom (the patch's), the tabL / phoneP
release frames `lens-carry-*.png`, the Artifact page.
