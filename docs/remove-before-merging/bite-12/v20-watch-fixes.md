# v20-watch-fixes — the proportional pivot allowance, the tap-in-the-air check

Builds `leg-timing.md` § 5 (proportional) and v14-catch's tap in the air.

## Step 1 — the proportional allowance (done)

- `pivotAllowance(lifted)` (`scripts/lib/veer-dash.ts`) is
  `1 / (1 − PIVOT_SHARE·|lifted|/π)`, 1 for `null`.
- **Not clamped at π**, as the prompt's formula had it, because the code
  does not clamp: `pivot` (`model/insect-motion.ts`) is
  `PIVOT_SHARE · span · |lifted| / π` with no cap, and `setOffFor`
  (`insect-steering.ts`, `evenly`) may fix `lifted` the long way round near a
  half turn, `|lifted|` up to π + `EVEN` (0.35) — a pivot of up to 0.278 of
  the leg. Clamped, such a leg's allowance would be short of its own pivot.
- The report's bound line names the half-turn bound ("after a half-turn
  pivot").
- `scripts/lib/veer-report.test.ts`: 7 tests — the allowance at a half turn,
  a quarter, either sign, and past a half turn; `flicks` passes a step
  between the bounds after a half turn and fails it after a 0.04 rad turn.

## Step 2 — the tap in the air (done)

- `scripts/lib/play-insects.ts`: a tap on the butterfly in the air is now
  checked for what v14-catch decided — `legs` one more than the leg it was
  on, `departs` within 100 ms of the tap, and `to` not the perch it was
  heading to (`isSamePerch`, the model's own; `nextFlight` picks a perch
  other than that one). The probe does not expose `shied`, and the probe is
  `src/`, so the dart itself is not checked; its look stays v14-catch's own
  `to-check.md` entry.
- The "Из прогона v19" entry in `to-check.md` is removed: its only line was
  this stale check.

## Step 3 — the play run, `--screens tabL,phoneP --plays veer,meadow`

At 852a2df. Frame median 22.0 ms tabL, 21.1 phoneP.

### Fly and bee overs: the 4 v19 predicted, no others

Fly bound 38.1 px at its own size, allowed `× 1/(1 − 0.25·|lifted|/π)`
(50.8 after a half turn).

| screen | leg             | flown | lifted | step, own size | allowed |
| ------ | --------------- | ----: | -----: | -------------: | ------: |
| tabL   | fly-3 cap→cap   |  0.55 |   1.41 |        43.9 px |    42.9 |
| phoneP | fly-18 cap→away |  0.54 |  −0.04 |        44.1 px |    38.2 |
| phoneP | fly-26 cap→away |  0.53 |   0.50 |        43.1 px |    39.7 |
| phoneP | fly-18 cap→away |  0.48 |  −0.04 |        40.8 px |    38.2 |

Bees: none over on either screen. Worst tabL bee-17 flower→flower 29.8 px
(lifted 1.71, allows 29.9); phoneP bee-8 air→flower 29.0 px (lifted
**3.16**, past a half turn — the long way round the allowance is left
unclamped for; allows 34.5). The fly overs are not traced: they are the
game's, and the brief stops at recording them.

### Other reds — all as at v19

- **The tap in the air passes** on both screens under the new check.
- Least drawn spans (harness, since v15): tabL butterfly 38.2 < 52, fly
  27.3 < 30; phoneP butterfly 36.6 < 52, fly 27.2 < 30.
- tabL: no butterfly ever rested on a cap to be tapped through (v15).
- tabL: butterfly-1 faced 0.38 rad off its way at 24 717 ms (away→away
  left, lifted 0.39) — on `to-check.md` under v17.
- phoneP: looking back, bee-11 sits at 0.969 of its own size (bound 0.97),
  at 0.63× x 280 d 13.29 — the same as v19.

## Left

- The 4 fly overs above are the game's to trace, if the orchestrator wants
  them; fly-18 (lifted −0.04) is the one no pivot explains at all.
