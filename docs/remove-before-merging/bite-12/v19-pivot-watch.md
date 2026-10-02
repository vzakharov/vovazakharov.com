# v19-pivot-watch — the veer watch allows a pivoted leg's dart

Builds `leg-timing.md` § 5.

## Step 1 — the bound (done)

- The fly-speed bound lives in `flicks` (`scripts/lib/veer-report.ts`), not
  `flier-watch.ts`: `dashPeak` × `DASH_SLACK`, per step at its own size.
- The probe could not tell a leg pivoted, so the veer record
  (`scripts/lib/veer-watch.ts`, `VEER` and `Sample`) carries one field more:
  `lifted`, the flier's `steering.setOff.turns.lifted` (`null` before the
  leg's first steered frame). A leg pivots exactly when `lifted ≠ 0`
  (`pivot` is proportional to `|lifted|`).
- `pivotAllowance(lifted)` (`scripts/lib/veer-dash.ts`): `1 / (1 − PIVOT_SHARE)`
  for a pivoted leg, 1 otherwise; `flicks` multiplies the own-size bound by
  it per step. The note and the failure line print both bounds, and each
  step's line its `lifted`.
- `PIVOT_SHARE` lives in `model/insect-motion.ts`, not `insect-steering.ts`
  as the prompt said; it is now exported from there (the one `src/` edit).
- `DASH_SLACK` exported for the test.
- Unit test: `scripts/lib/veer-report.test.ts` (5 tests) — the allowance, and
  `flicks` over synthetic fly frames: a step between the two bounds fails a
  leg that set off at once and passes a pivoted one; past the pivoted bound
  still fails.

## Step 2 — the play run, `--screens tabL,phoneP --plays veer,meadow`

At 1fdf65a. Frame median 22.1 ms tabL, 21.9 phoneP.

### Fly and bee overs: none left on either screen

| screen | fly overs (v18) | worst fly, own size   | bee overs (v18) | worst bee, own size   |
| ------ | --------------: | --------------------- | --------------: | --------------------- |
| tabL   |     0 (43, red) | 47.6 vs 50.8 (fly-29) |     0 (21, red) | 29.8 vs 34.4 (bee-17) |
| phoneP |     0 (not run) | 44.1 vs 50.8 (fly-18) |     0 (not run) | 29.0 vs 34.4 (bee-8)  |

Bounds: 38.1 px fly, 25.8 bee; ×4/3 after a pivot (50.8, 34.4).

From a throwaway count over the same run (`--no-build`, veer only,
not committed): the steps past the **unpivoted** bound are tabL fly 43
(the same 43 as v18 — the run is deterministic) and bee 21, phoneP fly 18
and bee 12, and **every one of them is on a leg with `lifted ≠ 0`**. So
v18's whole tabL red clears, as expected, and the bees' "known small
class" (bee-17 flower→flower, lifted 1.71) turns out to be the same pivot
and clears with it. The off-screen away legs v18 could not measure
(fly-21#3, 24#3, 29#3) carry lifted 3.10, −3.08, 3.09: turned right
round, as v18 inferred.

**One thing the decided bound lets through, for the orchestrator** (a
finding, not a reopening): the allowance is all-or-nothing, but a pivot's
time is `PIVOT_SHARE × |lifted| / π` of the leg. Held to the proportional
allowance `1 / (1 − PIVOT_SHARE·|lifted|/π)` instead, 4 steps would still be
over: tabL fly-3#3 cap→cap 43.9 px (lifted 1.41, allows 42.9); phoneP
fly-26#3 cap→away 43.1 (lifted 0.50, allows 39.7) and **fly-18#3 cap→away
44.1 and 40.8 (lifted −0.04)**. fly-18's pivot takes 0.3 % of its leg, so
its 1.16× bound (1.27× the curve) at flown 0.48–0.54 is not the pivot's: a
game cause the binary allowance hides — it looks like v18's "cap→away from
rest" class (fly-30#3 there, 1.13×, lifted 0.69). Not traced, not fixed.

### Other reds

Both screens:

- **A tap on a butterfly in the air "changed its flight"** (meadow; tabL
  butterfly-3, phoneP butterfly-5) — **harness's own**: `play-insects.ts`
  expects a tap in the air to leave the leg (`legs`, `departs`) as it was,
  but v14-catch decided a flier caught in the air shies off on a new leg.
  The check is stale. Line in `to-check.md` under "Из прогона v19".
- **Least drawn spans** (`LEAST_SPANS`, harness, as since v15): tabL
  butterfly 38.2 px < 52, fly 27.3 < 30; phoneP butterfly 36.6 < 52, fly
  27.2 < 30.

tabL only:

- **No butterfly ever rested on a cap to be tapped through** (meadow) —
  harness/design as v15 recorded: the clump's caps are held by flies.
- **butterfly-1 faced 0.38 rad off its way** at 24 717 ms (away→away
  left, lifted 0.39) — the game's, unchanged since v17; already on
  `to-check.md` under v17.

phoneP only:

- **Looking back, bee-11 sits at 0.969 of its own size** (bound 0.97,
  `BACK_SIZE`): on a flower at d 13.29, x 280, zoom 0.63× against its host's
  0.83× (ratio 0.76, the same as the four sitters beside it at d 13.2–13.7,
  which pass). The game's draw, 0.1 % under the line; most likely the
  sitter's bend at its x (`bendAt`), not measured further. Not fixed.

### Frames — `frames/bite-12/v19/`

- `phoneP-veer-walk-in-5.png` — walked into fly-30 hovering (zoom 1.74×,
  bound 1.78).
- `phoneP-veer-back-perched.png` — looking back, the far sitters bee-11 is
  among (tiny at the flowers on the right).
- `phoneP-f2-fly-startled.png` — a fly startled off its cap.

## Left

- fly-18#3's dart with no pivot to explain it (above), if the orchestrator
  wants it traced.
- The stale tap-in-the-air check in `play-insects.ts` (not this package's
  file to change beyond the watch).
